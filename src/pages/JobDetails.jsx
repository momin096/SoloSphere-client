import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { compareAsc } from "date-fns";
import { useNavigate, useParams } from 'react-router-dom'
import { AuthContext } from '../providers/AuthProvider'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'

const JobDetails = () => {
  const [startDate, setStartDate] = useState(new Date())
  const [job, setJob] = useState({})
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();


  const { id } = useParams();

  useEffect(() => {
    fetchData();
  }, [id])

  const fetchData = async () => {
    const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/job/${id}`)
    setJob(data)
    // setStartDate(new Date(data.deadLine))
    console.log(data);
  }

  const { buyer } = job || {};



  const handleSubmit = async e => {

    e.preventDefault();

    const form = e.target;
    const price = form.price.value;
    const email = user?.email;
    const comment = form.comment.value;
    const deadLine = startDate;
    const jobId = job._id;

    // 1. check bid permission validation
    if (user?.email === buyer?.email) {
      return toast.error('Action not permitted!!!')
    }

    // 2. deadline cross validation
    if (compareAsc(new Date(), new Date(job.deadLine)) === 1) {
      return toast.error('DeadLine Crossed, Bidding Forbidden')
    }
    // 3. price within maximum price range validation
    if (job.maxPrice < price) {
      return toast.error('Offer less or equal to maximum price')
    }

    // 4 . offers deadline and seller deadline validation

    if (compareAsc(new Date(startDate), new Date(job.deadLine)) === 1) {
      return toast.error('Offer a deadline within deadline')
    }

    const bidData = {
      jobId,
      price,
      email,
      comment,
      deadLine,
      title: job.title,
      category: job.category,
      status: 'Pending',
      buyer: buyer?.email,
    }


    try {
      // make a post request
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/add-bid`,
        bidData,
      )
      // reset the form 
      form.reset();
      if (data.insertedId) {
        toast.success('Job Bidding Successfully !!!')
      }
      navigate('/my-bids');
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message)
    }

  }

  return (
    <div className='flex flex-col md:flex-row justify-around gap-5  items-center min-h-[calc(100vh-306px)] md:max-w-screen-xl mx-auto '>
      {/* Job Details */}
      <div className='flex-1  px-4 py-7 bg-white rounded-md shadow-md md:min-h-[350px]'>
        <div className='flex items-center justify-between'>
          <span className='text-sm font-light text-gray-800 '>
            Deadline: {job.deadLine ? format(new Date(job.deadLine), 'P') : 'Loading..'}
          </span>
          <span className='px-4 py-1 text-xs text-blue-800 uppercase bg-blue-200 rounded-full '>
            {job.category}
          </span>
        </div>

        <div>
          <h1 className='mt-2 text-3xl font-semibold text-gray-800 '>
            {job.title}
          </h1>

          <p className='mt-2 text-lg text-gray-600 '>
            {job.description}
          </p>
          <p className='mt-6 text-sm font-bold text-gray-600 '>
            Buyer Details:
          </p>
          <div className='flex items-center gap-5'>
            <div>
              <p className='mt-2 text-sm  text-gray-600 '>
                Name: {job.buyer?.name}
              </p>
              <p className='mt-2 text-sm  text-gray-600 '>
                Email: {job.buyer?.email}
              </p>
            </div>
            <div className='rounded-full object-cover overflow-hidden w-14 h-14'>
              <img
                referrerPolicy='no-referrer'
                src={job.buyer?.photo}
                alt={job.buyer?.name}
              />
            </div>
          </div>
          <p className='mt-6 text-lg font-bold text-gray-600 '>
            Range: ${job.minPrice} - ${job.maxPrice}
          </p>
        </div>
      </div>
      {/* Place A Bid Form */}
      <section className='p-6 w-full  bg-white rounded-md shadow-md flex-1 md:min-h-[350px]'>
        <h2 className='text-lg font-semibold text-gray-700 capitalize '>
          Place A Bid
        </h2>

        <form onSubmit={handleSubmit}>
          <div className='grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2'>
            <div>
              <label className='text-gray-700 ' htmlFor='price'>
                Price
              </label>
              <input
                id='price'
                type='text'
                name='price'
                required
                className='block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md   focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40  focus:outline-none focus:ring'
              />
            </div>

            <div>
              <label className='text-gray-700 ' htmlFor='emailAddress'>
                Email Address
              </label>
              <input
                id='emailAddress'
                type='email'
                defaultValue={user.email}
                name='email'
                disabled
                className='block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md   focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40  focus:outline-none focus:ring'
              />
            </div>

            <div>
              <label className='text-gray-700 ' htmlFor='comment'>
                Comment
              </label>
              <input
                id='comment'
                name='comment'
                type='text'
                className='block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md   focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40  focus:outline-none focus:ring'
              />
            </div>
            <div className='flex flex-col gap-2 '>
              <label className='text-gray-700'>Deadline</label>

              {/* Date Picker Input Field */}
              <DatePicker
                className='border p-2 rounded-md'
                selected={startDate}
                onChange={date => setStartDate(date)}
              />
            </div>
          </div>

          <div className='flex justify-end mt-6'>
            <button
              type='submit'
              className='px-8 py-2.5 leading-5 text-white transition-colors duration-300 transform bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:bg-gray-600'
            >
              Place Bid
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default JobDetails

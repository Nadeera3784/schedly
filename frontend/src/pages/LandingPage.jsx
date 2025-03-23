import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LandingPage() {
  const { user } = useAuth();
  
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-indigo-100/20">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>
        
        <div className="mx-auto max-w-7xl px-6 pt-10 pb-24 sm:pb-32 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:pt-40">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
            <div className="flex">
              <div className="relative flex items-center gap-x-4 rounded-full px-4 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                <span className="font-semibold text-indigo-600">New Feature</span>
                <span className="h-4 w-px bg-gray-900/10" aria-hidden="true" />
                <a href="#" className="flex items-center gap-x-1">
                  Calendar Analytics
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
            <h1 className="mt-10 max-w-lg text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Your Time, <span className="text-indigo-600">Simplified</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              The modern scheduling platform that eliminates back-and-forth emails. Book meetings, manage appointments, and grow your business - all in one place.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              {user ? (
                <Link to="/dashboard" className="rounded-md bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register" className="rounded-md bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                    Start Free Trial
                  </Link>
                  <Link to="/login" className="text-lg font-semibold leading-6 text-gray-900 hover:text-indigo-600">
                    Login <span aria-hidden="true">→</span>
                  </Link>
                </>
              )}
            </div>
            <div className="mt-10 flex items-center gap-x-6">
              <div className="flex -space-x-2">
                <img className="relative z-30 inline-block h-10 w-10 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
                <img className="relative z-20 inline-block h-10 w-10 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
                <img className="relative z-10 inline-block h-10 w-10 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80" alt="" />
              </div>
              <span className="text-sm text-gray-600">Trusted by 10,000+ professionals worldwide</span>
            </div>
          </div>
          <div className="mt-16 sm:mt-24 lg:mt-0 lg:flex-shrink-0 lg:flex-grow">
            <div className="relative mx-auto w-full max-w-lg">
              <div className="absolute -inset-y-6 -inset-x-4 z-0 scale-95 bg-gradient-to-r from-indigo-500/50 to-purple-500/50 opacity-20 blur-2xl sm:inset-x-6 sm:rounded-[20px]"></div>
              <div className="relative z-10 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-900/10">
                {/* Calendar UI Preview */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <h2 className="text-lg font-semibold text-gray-900">March 2024</h2>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {[...Array(35)].map((_, index) => {
                      const day = index - 4; // Start from February 26
                      const isCurrentMonth = day > 0 && day <= 31;
                      const isToday = day === 15;
                      const hasAvailability = [3, 4, 5, 10, 11, 12, 17, 18, 19, 24, 25, 26].includes(day);
                      const isWeekend = index % 7 === 0 || index % 7 === 6;
                      
                      return (
                        <div
                          key={index}
                          className={`
                            relative p-2 text-center cursor-pointer
                            ${isCurrentMonth ? (isWeekend ? 'text-gray-400' : 'hover:bg-gray-50') : 'text-gray-300'}
                            ${isToday ? 'bg-indigo-50 text-indigo-600 font-semibold' : ''}
                            ${hasAvailability && isCurrentMonth && !isWeekend ? 'border-b-2 border-indigo-600' : ''}
                          `}
                        >
                          <span className="text-sm">{isCurrentMonth ? day : day <= 0 ? 31 + day : day - 31}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Available Time Slots */}
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Available Time Slots - March 15</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="text-sm px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-indigo-600 hover:text-indigo-600 transition-colors">
                      9:00 AM - 9:30 AM
                    </button>
                    <button className="text-sm px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-indigo-600 hover:text-indigo-600 transition-colors">
                      9:30 AM - 10:00 AM
                    </button>
                    <button className="text-sm px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-indigo-600 hover:text-indigo-600 transition-colors">
                      10:00 AM - 10:30 AM
                    </button>
                    <button className="text-sm px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-indigo-600 hover:text-indigo-600 transition-colors">
                      10:30 AM - 11:00 AM
                    </button>
                    <button className="text-sm px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-indigo-600 hover:text-indigo-600 transition-colors">
                      2:00 PM - 2:30 PM
                    </button>
                    <button className="text-sm px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-indigo-600 hover:text-indigo-600 transition-colors">
                      2:30 PM - 3:00 PM
                    </button>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <span className="w-3 h-0.5 bg-indigo-600 mr-2"></span>
                      <span>Available Days</span>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-block w-2 h-2 bg-gray-200 rounded-full mr-2"></span>
                      <span>Unavailable</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Trusted by businesses worldwide
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-600">
                Companies of all sizes trust Schedly to manage their scheduling needs
              </p>
            </div>
            <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col bg-gray-50 p-8">
                <dt className="text-sm font-semibold leading-6 text-gray-600">Active users</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">10k+</dd>
              </div>
              <div className="flex flex-col bg-gray-50 p-8">
                <dt className="text-sm font-semibold leading-6 text-gray-600">Meetings scheduled</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">300k+</dd>
              </div>
              <div className="flex flex-col bg-gray-50 p-8">
                <dt className="text-sm font-semibold leading-6 text-gray-600">Hours saved</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">1M+</dd>
              </div>
              <div className="flex flex-col bg-gray-50 p-8">
                <dt className="text-sm font-semibold leading-6 text-gray-600">Customer satisfaction</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">99%</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">Everything you need</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Powerful features for modern scheduling
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              All the tools you need to streamline your scheduling workflow and grow your business
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <svg className="h-5 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5.25 12a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H6a.75.75 0 01-.75-.75V12zM6 13.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V14a.75.75 0 00-.75-.75H6zM7.25 12a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H8a.75.75 0 01-.75-.75V12zM8 13.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V14a.75.75 0 00-.75-.75H8z" />
                  </svg>
                  Smart Scheduling
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">Intelligent scheduling that adapts to your preferences and availability. Set buffer times, customize meeting lengths, and more.</p>
                  <p className="mt-6">
                    <a href="#" className="text-sm font-semibold leading-6 text-indigo-600">Learn more <span aria-hidden="true">→</span></a>
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <svg className="h-5 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3.75 3.75a.75.75 0 00-1.5 0v.5h-.5a.75.75 0 000 1.5h.5v.5a.75.75 0 001.5 0v-.5h.5a.75.75 0 000-1.5h-.5v-.5zM4 12a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 011 1v4a1 1 0 01-1 1H4zM12 4a1 1 0 01-1-1V1a1 1 0 011-1h3a1 1 0 011 1v2a1 1 0 01-1 1h-3zM12 12a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 011 1v4a1 1 0 01-1 1h-3z" />
                  </svg>
                  Calendar Integration
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">Seamlessly sync with Google Calendar, Outlook, and other popular calendar services. Never double-book again.</p>
                  <p className="mt-6">
                    <a href="#" className="text-sm font-semibold leading-6 text-indigo-600">Learn more <span aria-hidden="true">→</span></a>
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <svg className="h-5 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M15.5 2A1.5 1.5 0 0014 3.5v13a1.5 1.5 0 001.5 1.5h1a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0016.5 2h-1zM9.5 6A1.5 1.5 0 008 7.5v9A1.5 1.5 0 009.5 18h1a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0010.5 6h-1zM3.5 10A1.5 1.5 0 002 11.5v5A1.5 1.5 0 003.5 18h1A1.5 1.5 0 006 16.5v-5A1.5 1.5 0 004.5 10h-1z" />
                  </svg>
                  Analytics & Insights
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">Track meeting patterns, popular time slots, and booking trends. Make data-driven decisions to optimize your schedule.</p>
                  <p className="mt-6">
                    <a href="#" className="text-sm font-semibold leading-6 text-indigo-600">Learn more <span aria-hidden="true">→</span></a>
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
      
      {/* How it Works Section */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">Simple Process</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">How Schedly Works</p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Get started in minutes with our simple three-step process
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-lg bg-indigo-600 p-2 ring-1 ring-indigo-600/10">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <dt className="mt-4 font-semibold text-gray-900">1. Create Your Calendar</dt>
                <dd className="mt-2 leading-7 text-gray-600">Set up your availability preferences and customize your booking page</dd>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="rounded-lg bg-indigo-600 p-2 ring-1 ring-indigo-600/10">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                  </svg>
                </div>
                <dt className="mt-4 font-semibold text-gray-900">2. Share Your Link</dt>
                <dd className="mt-2 leading-7 text-gray-600">Share your personalized booking link with clients and colleagues</dd>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="rounded-lg bg-indigo-600 p-2 ring-1 ring-indigo-600/10">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <dt className="mt-4 font-semibold text-gray-900">3. Get Booked</dt>
                <dd className="mt-2 leading-7 text-gray-600">Receive bookings and automatic calendar updates</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Simple, transparent pricing</h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Choose the perfect plan for your scheduling needs
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-gray-200 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
            <div className="p-8 sm:p-10 lg:flex-auto">
              <h3 className="text-2xl font-bold tracking-tight text-gray-900">Professional</h3>
              <p className="mt-6 text-base leading-7 text-gray-600">
                Perfect for professionals and small businesses looking to streamline their scheduling
              </p>
              <div className="mt-10 flex items-center gap-x-4">
                <h4 className="flex-none text-sm font-semibold leading-6 text-indigo-600">What's included</h4>
                <div className="h-px flex-auto bg-gray-100"></div>
              </div>
              <ul role="list" className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-600 sm:grid-cols-2 sm:gap-6">
                <li className="flex gap-x-3">
                  <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Unlimited calendars
                </li>
                <li className="flex gap-x-3">
                  <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Calendar integrations
                </li>
                <li className="flex gap-x-3">
                  <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Email notifications
                </li>
                <li className="flex gap-x-3">
                  <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Basic analytics
                </li>
              </ul>
            </div>
            <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
              <div className="rounded-2xl bg-gray-50 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
                <div className="mx-auto max-w-xs px-8">
                  <p className="text-base font-semibold text-gray-600">Monthly subscription</p>
                  <p className="mt-6 flex items-baseline justify-center gap-x-2">
                    <span className="text-5xl font-bold tracking-tight text-gray-900">$15</span>
                    <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600">/month</span>
                  </p>
                  <Link to="/register" className="mt-10 block w-full rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                    Get started
                  </Link>
                  <p className="mt-6 text-xs leading-5 text-gray-600">
                    Invoices and receipts available for easy company reimbursement
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Testimonials Section */}
      <div className="relative isolate overflow-hidden bg-white px-6 py-24 sm:py-32 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] opacity-20"></div>
        <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center"></div>
        <div className="mx-auto max-w-2xl lg:max-w-4xl">
          <h2 className="text-center text-lg font-semibold leading-8 tracking-tight text-indigo-600">Testimonials</h2>
          <figure className="mt-10">
            <blockquote className="text-center text-xl font-semibold leading-8 text-gray-900 sm:text-2xl sm:leading-9">
              <p>
                "Schedly has transformed how I manage my consulting business. The automated scheduling and reminders have saved me countless hours and helped me grow my client base significantly."
              </p>
            </blockquote>
            <figcaption className="mt-10">
              <img
                className="mx-auto h-10 w-10 rounded-full"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt=""
              />
              <div className="mt-4 flex items-center justify-center space-x-3 text-base">
                <div className="font-semibold text-gray-900">Sarah Thompson</div>
                <svg viewBox="0 0 2 2" width={3} height={3} aria-hidden="true" className="fill-gray-900">
                  <circle cx={1} cy={1} r={1} />
                </svg>
                <div className="text-gray-600">Business Consultant</div>
              </div>
            </figcaption>
          </figure>
        </div>
      </div>
      
      {/* Final CTA Section */}
      <div className="bg-white">
        <div className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="relative isolate overflow-hidden bg-gray-900 px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Start saving time today
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
              Join thousands of professionals who have streamlined their scheduling process with Schedly.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/register"
                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Get started for free
              </Link>
              <Link to="/login" className="text-sm font-semibold leading-6 text-white">
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
            <svg
              viewBox="0 0 1024 1024"
              className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
              aria-hidden="true"
            >
              <circle cx={512} cy={512} r={512} fill="url(#827591b1-ce8c-4110-b064-7cb85a0b1217)" fillOpacity="0.7" />
              <defs>
                <radialGradient id="827591b1-ce8c-4110-b064-7cb85a0b1217">
                  <stop stopColor="#7775D6" />
                  <stop offset={1} stopColor="#E935C1" />
                </radialGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage; 
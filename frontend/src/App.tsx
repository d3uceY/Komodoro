import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useState } from 'react';


function App() {

  const [duration, _] = useState(300);

  useGSAP(() => {
    // GSAP animations go here
    gsap.to(".single-clock-hand", {
      rotation: 360,
      duration: duration,
      ease: `steps(${duration})`, 
    });
  }, [duration]);


  return (
    <>
      <div className="w-100 aspect-square border border-black rounded-full relative flex items-center justify-center">
        <div className="single-clock-hand h-full w-6 bg-black absolute">
          <div className="bg-red-600 w-full h-10 absolute top-0 left-0 right-0">

          </div>
        </div>
      </div>
    </>
  )
}

export default App

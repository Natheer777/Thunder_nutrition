import './Popular.css'
import img1  from '../../assets/Home/Asset 1@4x.png'
import img2  from '../../assets/Home/Asset 2@4x.png'
import img3  from '../../assets/Home/Asset 3@4x.png'
export default function Popular() {
  return (
    <>
    <div className="Popular mt-5 mb-5 pt-3">
       <h1>
        Popular Now
       </h1>
       <ul className='mt-5 '>
        <li className='left'>
            <img  src={img1} alt="" />
            <h2>ISO PROTEIN</h2>
        </li>
        <li className='top'>
            <img  src={img2} alt="" />
            <h2>CARBO MIX</h2>

        </li>
        <li className='right'>
            <img  src={img3} alt="" />
            <h2>WHEY PROTEIN</h2>

        </li>
       </ul>
    </div>
    </>
  )
}

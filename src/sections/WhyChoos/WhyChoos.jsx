import './WhyChoos.css'
import img1 from '../../assets/Home/Asset 4@4x.png'
import img2 from '../../assets/Home/Asset 5@4x.png'
import img3 from '../../assets/Home/Asset 6@4x.png'
import img4 from '../../assets/Home/Asset 7@4x.png'
export default function WhyChoos() {
  return (
    <>
    <div className="WhyChoos mt-5 mb-5 pt-4">
        <h1>WHY CHOOSE THUNDER ?</h1>
        <ul>
            <li className='left'><span><img src={img1} className='hidden' alt="" /></span> Superior Quality</li>
            <li className='left TunderSvg'><span><img src={img2} className='hidden' alt="" /></span> Real results,guaranteed</li>
            <li className='left'><span><img src={img3} className='hidden' alt="" /></span> Innovative Formulas</li>
            <li className='left body'><span><img src={img4} className='hidden' alt="" /></span> Nutrition for champions</li>
        </ul>
    </div>
    </>
  )
}

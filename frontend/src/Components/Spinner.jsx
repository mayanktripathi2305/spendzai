import React from 'react'
function Spinner() {
  return (

    <div className='h-[106vh]  flex items-center justify-center   -mt-10 fixed inset-0 bg-black/65 backdrop-blur-sm z-50'>

    <div className='  flex items-center justify-center   -mt-10 '>

        <div  className=''>
            {/* <img src="https://media4.giphy.com/media/twn3qOrkv9KBGgn0bc/giphy.gif?cid=6c09b952lvi581u7ylhd6bnt3qv0s3yup2aypnzl9mrgec3c&ep=v1_stickers_search&rid=giphy.gif&ct=s" alt="" width={250} /> */}
            <img src="https://i.pinimg.com/originals/49/23/29/492329d446c422b0483677d0318ab4fa.gif" alt="" width={650} />
            {/* <img src="https://cdn.pixabay.com/animation/2023/10/08/03/19/03-19-26-213_512.gif" alt="" width={250} /> */}

        </div>
    </div>

    </div>
  )
}

export default Spinner

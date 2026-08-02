import React from 'react'
import { FadeLoader } from 'react-spinners'
const Spinner = ({loading}) => {
    const override={
        display:'block',
        margin:'100px auto'
    }

  return (
    <FadeLoader 
        color='#30364F'
        loading={loading}
        cssOverride={override}
        size={150}
    />
  )
}

export default Spinner
import { BACKEND_URL } from '@/lib/config'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

const Result = () => {
    const [result, setResult] = useState({})
    const { id } = useParams()

    useEffect(() => {
        async function fetchResult() {
            const response = await axios.get(`${BACKEND_URL}/api/v1/result/${id}`)
            setResult(response.data)
            console.log(response)
        }
 
        fetchResult()
    }, [id])

    return (
        <div>
            Ayush
            {result.overallScore}
            {result.technicalKnowledge}
        </div>
    )
}

export default Result

import { BACKEND_URL } from '@/lib/config'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const Result = () => {
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const { id } = useParams()

    useEffect(() => {
        async function fetchResult() {
            try {
                const response = await axios.get(`${BACKEND_URL}/api/v1/result/${id}`)
                let data = response.data;
                
                // The LLM might return a stringified JSON
                if (typeof data === 'string') {
                    try {
                        // Strip potential markdown JSON wrappers
                        const cleanStr = data.replace(/```json/g, '').replace(/```/g, '').trim();
                        data = JSON.parse(cleanStr);
                    } catch (e) {
                        console.error("Failed to parse JSON result", e);
                    }
                }
                setResult(data)
            } catch (err) {
                console.error("Failed to fetch result", err);
            } finally {
                setLoading(false);
            }
        }
 
        fetchResult()
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <p className="text-slate-500 font-medium">Evaluating interview session...</p>
            </div>
        )
    }

    if (!result) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <p className="text-slate-500 font-medium">Failed to load results. Please try again.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="mx-auto max-w-4xl space-y-8">
                
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Interview Report</h1>
                        <p className="text-slate-500 mt-1">Detailed evaluation of your performance</p>
                    </div>
                    <Link to="/">
                        <Button variant="outline">New Interview</Button>
                    </Link>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="bg-white shadow-sm border-slate-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Overall Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-4xl font-bold text-slate-900">{result.overallScore || 0}</span>
                                <span className="text-slate-500 mb-1">/ 100</span>
                            </div>
                            <Progress value={result.overallScore || 0} className="h-2" />
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm border-slate-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Technical Knowledge</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-4xl font-bold text-slate-900">{result.technicalKnowledge || 0}</span>
                                <span className="text-slate-500 mb-1">/ 100</span>
                            </div>
                            <Progress value={result.technicalKnowledge || 0} className="h-2" />
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-white shadow-sm border-slate-200">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-semibold text-slate-900">Feedback Summary</CardTitle>
                            {result.recommendation && (
                                <Badge variant={result.recommendation.toLowerCase().includes('hire') && !result.recommendation.toLowerCase().includes('no') ? 'default' : 'destructive'} className="text-sm px-3 py-1">
                                    {result.recommendation}
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {result.feedback || "No feedback provided."}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}

export default Result

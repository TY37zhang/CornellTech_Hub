"use client"

import { useState } from "react"
import { Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

export default function AddReviewPage() {
  const [rating, setRating] = useState<number>(0)
  const [difficulty, setDifficulty] = useState<number>(5)
  const [workload, setWorkload] = useState<number>(5)
  const [value, setValue] = useState<number>(5)

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <section className="w-full py-12 md:py-16 lg:py-12 bg-gradient-to-b from-red-50 to-white dark:from-red-950/20 dark:to-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Write a Course Review</h1>
                <p className="max-w-[700px] text-muted-foreground md:text-xl">
                  Share your experience to help other students make informed decisions.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="container px-4 py-6 md:px-6">
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle>Course Review Form</CardTitle>
              <CardDescription>
                Please provide honest and constructive feedback about your experience with this course.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Select>
                  <SelectTrigger id="course">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="machine-learning">Machine Learning</SelectItem>
                    <SelectItem value="product-studio">Product Studio</SelectItem>
                    <SelectItem value="business-fundamentals">Business Fundamentals</SelectItem>
                    <SelectItem value="hci">Human-Computer Interaction</SelectItem>
                    <SelectItem value="startup-systems">Startup Systems</SelectItem>
                    <SelectItem value="leadership">Leadership in Digital Transformation</SelectItem>
                    <SelectItem value="other">Other (specify below)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="other-course">Other Course (if not in the list above)</Label>
                <Input id="other-course" placeholder="Enter course name" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="professor">Professor</Label>
                <Input id="professor" placeholder="Enter professor's name" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="semester">Semester Taken</Label>
                <Select>
                  <SelectTrigger id="semester">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fall-2023">Fall 2023</SelectItem>
                    <SelectItem value="spring-2023">Spring 2023</SelectItem>
                    <SelectItem value="fall-2022">Fall 2022</SelectItem>
                    <SelectItem value="spring-2022">Spring 2022</SelectItem>
                    <SelectItem value="fall-2021">Fall 2021</SelectItem>
                    <SelectItem value="spring-2021">Spring 2021</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Overall Rating</Label>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button key={value} type="button" onClick={() => setRating(value)} className="focus:outline-none">
                        <Star
                          className={`h-8 w-8 ${
                            value <= rating ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {rating === 0 ? "Select a rating" : `${rating} star${rating !== 1 ? "s" : ""}`}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Difficulty</Label>
                    <span className="text-sm">{difficulty}/10</span>
                  </div>
                  <Slider
                    value={[difficulty]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(value) => setDifficulty(value[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Very Easy</span>
                    <span>Very Difficult</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Workload</Label>
                    <span className="text-sm">{workload}/10</span>
                  </div>
                  <Slider
                    value={[workload]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(value) => setWorkload(value[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Light</span>
                    <span>Heavy</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Value</Label>
                    <span className="text-sm">{value}/10</span>
                  </div>
                  <Slider value={[value]} min={1} max={10} step={1} onValueChange={(value) => setValue(value[0])} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Not Valuable</span>
                    <span>Very Valuable</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-title">Review Title</Label>
                <Input id="review-title" placeholder="Summarize your experience in a short title" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-content">Review Content</Label>
                <Textarea
                  id="review-content"
                  placeholder="Share your detailed experience with this course..."
                  className="min-h-[150px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Would you recommend this course?</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="recommend-yes" name="recommend" className="h-4 w-4" />
                    <Label htmlFor="recommend-yes" className="text-sm font-normal">
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="recommend-no" name="recommend" className="h-4 w-4" />
                    <Label htmlFor="recommend-no" className="text-sm font-normal">
                      No
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="recommend-maybe" name="recommend" className="h-4 w-4" />
                    <Label htmlFor="recommend-maybe" className="text-sm font-normal">
                      It depends
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tips">Tips for Future Students</Label>
                <Textarea
                  id="tips"
                  placeholder="Any advice for students who might take this course?"
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button>Submit Review</Button>
            </CardFooter>
          </Card>
        </section>
      </div>
    </div>
  )
}

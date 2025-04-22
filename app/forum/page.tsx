import Link from "next/link"
import {
  BookOpen,
  Filter,
  MessageSquare,
  PlusCircle,
  Search,
  SortAsc,
  Tag,
  ThumbsUp,
  TrendingUp,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ForumPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-16 bg-gradient-to-b from-red-50 to-white dark:from-red-950/20 dark:to-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Student Forum</h1>
                <p className="max-w-[700px] text-muted-foreground md:text-xl">
                  Connect with fellow Cornell Tech students, ask questions, and share knowledge.
                </p>
              </div>
              <div className="w-full max-w-2xl space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search discussions by topic, keyword, or author..."
                    className="w-full bg-background pl-8 rounded-md border"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <Filter className="h-3.5 w-3.5" />
                    <span>Filters</span>
                  </Button>
                  <Select defaultValue="all">
                    <SelectTrigger className="h-8 w-[130px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="academics">Academics</SelectItem>
                      <SelectItem value="career">Career</SelectItem>
                      <SelectItem value="campus">Campus Life</SelectItem>
                      <SelectItem value="tech">Technology</SelectItem>
                      <SelectItem value="events">Events</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="all">
                    <SelectTrigger className="h-8 w-[130px]">
                      <SelectValue placeholder="Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="activity">
                    <SelectTrigger className="h-8 w-[130px]">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activity">Recent Activity</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="replies">Most Replies</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container px-4 py-6 md:px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Discussions</h2>
            <Button className="gap-1">
              <PlusCircle className="h-4 w-4" />
              <span>New Thread</span>
            </Button>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">All Discussions</TabsTrigger>
                <TabsTrigger value="trending">Trending</TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1">
                  <SortAsc className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sort</span>
                </Button>
              </div>
            </div>

            <TabsContent value="all" className="mt-6">
              <div className="grid gap-4">
                {/* Thread 1 */}
                <Link href="/forum/internship-tips" className="group">
                  <Card className="transition-all hover:border-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl group-hover:text-primary">
                            Tips for landing summer internships at FAANG companies?
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="@user1" />
                              <AvatarFallback>U1</AvatarFallback>
                            </Avatar>
                            <span>Alex Johnson</span>
                            <span>•</span>
                            <span>2 days ago</span>
                          </CardDescription>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-800/20 dark:text-blue-400">
                          Career
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="line-clamp-2 text-muted-foreground">
                        I'm starting to prepare for summer internship applications and would love to hear from anyone
                        who has successfully landed positions at top tech companies. What was your preparation strategy?
                        Any specific resources you found helpful for technical interviews?
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="outline" className="text-xs font-normal">
                          internships
                        </Badge>
                        <Badge variant="outline" className="text-xs font-normal">
                          tech-interviews
                        </Badge>
                        <Badge variant="outline" className="text-xs font-normal">
                          career-advice
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>24 replies</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>18 likes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>42 views</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                        >
                          Hot
                        </Badge>
                      </div>
                    </CardFooter>
                  </Card>
                </Link>

                {/* Thread 2 */}
                <Link href="/forum/housing-nyc" className="group">
                  <Card className="transition-all hover:border-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl group-hover:text-primary">
                            Housing options near Cornell Tech campus
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="@user2" />
                              <AvatarFallback>U2</AvatarFallback>
                            </Avatar>
                            <span>Maya Patel</span>
                            <span>•</span>
                            <span>1 week ago</span>
                          </CardDescription>
                        </div>
                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-800/20 dark:text-purple-400">
                          Campus Life
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="line-clamp-2 text-muted-foreground">
                        I'm an incoming student for the fall semester and looking for housing options. What are the best
                        neighborhoods to consider? Is The House at Cornell Tech worth the cost? Any recommendations for
                        finding roommates or affordable alternatives in Manhattan or Queens?
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="outline" className="text-xs font-normal">
                          housing
                        </Badge>
                        <Badge variant="outline" className="text-xs font-normal">
                          nyc-living
                        </Badge>
                        <Badge variant="outline" className="text-xs font-normal">
                          roommates
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>36 replies</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>22 likes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>78 views</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                        >
                          Hot
                        </Badge>
                      </div>
                    </CardFooter>
                  </Card>
                </Link>

                {/* Thread 3 */}
                <Link href="/forum/startup-ideas" className="group">
                  <Card className="transition-all hover:border-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl group-hover:text-primary">
                            Startup ideas for Product Studio
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="@user3" />
                              <AvatarFallback>U3</AvatarFallback>
                            </Avatar>
                            <span>David Kim</span>
                            <span>•</span>
                            <span>3 days ago</span>
                          </CardDescription>
                        </div>
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-800/20 dark:text-red-400">
                          Academics
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="line-clamp-2 text-muted-foreground">
                        I'm brainstorming potential startup ideas for Product Studio this fall. Looking for feedback on
                        a few concepts I've been developing, and also curious to hear what areas others are exploring.
                        Anyone interested in forming a team around fintech or healthcare innovations?
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="outline" className="text-xs font-normal">
                          product-studio
                        </Badge>
                        <Badge variant="outline" className="text-xs font-normal">
                          startups
                        </Badge>
                        <Badge variant="outline" className="text-xs font-normal">
                          team-formation
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>12 replies</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>9 likes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>31 views</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400"
                        >
                          New
                        </Badge>
                      </div>
                    </CardFooter>
                  </Card>
                </Link>

                {/* Thread 4 */}
                <Link href="/forum/ml-resources" className="group">
                  <Card className="transition-all hover:border-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl group-hover:text-primary">
                            Best resources for Machine Learning course
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="@user4" />
                              <AvatarFallback>U4</AvatarFallback>
                            </Avatar>
                            <span>Sarah Chen</span>
                            <span>•</span>
                            <span>5 days ago</span>
                          </CardDescription>
                        </div>
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-800/20 dark:text-red-400">
                          Academics
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="line-clamp-2 text-muted-foreground">
                        I'm taking the Machine Learning course this semester and looking for supplementary resources.
                        The textbook is good but I'm looking for more practical tutorials and examples. Has anyone found
                        good YouTube channels, online courses, or GitHub repositories that complement the class
                        material?
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="outline" className="text-xs font-normal">
                          machine-learning
                        </Badge>
                        <Badge variant="outline" className="text-xs font-normal">
                          course-resources
                        </Badge>
                        <Badge variant="outline" className="text-xs font-normal">
                          study-materials
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>18 replies</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>15 likes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>47 views</span>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                </Link>

                {/* Thread 5 */}
                <Link href="/forum/networking-events" className="group">
                  <Card className="transition-all hover:border-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl group-hover:text-primary">
                            Upcoming networking events in NYC tech scene
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="@user5" />
                              <AvatarFallback>U5</AvatarFallback>
                            </Avatar>
                            <span>James Wilson</span>
                            <span>•</span>
                            <span>2 days ago</span>
                          </CardDescription>
                        </div>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-800/20 dark:text-green-400">
                          Events
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="line-clamp-2 text-muted-foreground">
                        I'm compiling a list of upcoming tech networking events in NYC for the next few months. So far I
                        have NY Tech Meetup, Startup Grind, and a few company-specific events. Anyone know of other good
                        events or communities worth joining? Especially interested in AI and fintech.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="outline" className="text-xs font-normal">
                          networking
                        </Badge>
                        <Badge variant="outline" className="text-xs font-normal">
                          nyc-tech
                        </Badge>
                        <Badge variant="outline" className="text-xs font-normal">
                          events
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>7 replies</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>11 likes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>29 views</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400"
                        >
                          New
                        </Badge>
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="trending" className="mt-6">
              <div className="grid gap-4">
                {/* Trending threads would go here */}
                <Link href="/forum/housing-nyc" className="group">
                  <Card className="transition-all hover:border-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl group-hover:text-primary">
                            Housing options near Cornell Tech campus
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="@user2" />
                              <AvatarFallback>U2</AvatarFallback>
                            </Avatar>
                            <span>Maya Patel</span>
                            <span>•</span>
                            <span>1 week ago</span>
                          </CardDescription>
                        </div>
                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-800/20 dark:text-purple-400">
                          Campus Life
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="line-clamp-2 text-muted-foreground">
                        I'm an incoming student for the fall semester and looking for housing options. What are the best
                        neighborhoods to consider? Is The House at Cornell Tech worth the cost? Any recommendations for
                        finding roommates or affordable alternatives in Manhattan or Queens?
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="outline" className="text-xs font-normal">
                          housing
                        </Badge>
                        <Badge variant="outline" className="text-xs font-normal">
                          nyc-living
                        </Badge>
                        <Badge variant="outline" className="text-xs font-normal">
                          roommates
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>36 replies</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>22 likes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>78 views</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                        >
                          Hot
                        </Badge>
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="popular" className="mt-6">
              <div className="grid gap-4">
                {/* Popular threads would go here */}
                <Link href="/forum/internship-tips" className="group">
                  <Card className="transition-all hover:border-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl group-hover:text-primary">
                            Tips for landing summer internships at FAANG companies?
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="@user1" />
                              <AvatarFallback>U1</AvatarFallback>
                            </Avatar>
                            <span>Alex Johnson</span>
                            <span>•</span>
                            <span>2 days ago</span>
                          </CardDescription>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-800/20 dark:text-blue-400">
                          Career
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="line-clamp-2 text-muted-foreground">
                        I'm starting to prepare for summer internship applications and would love to hear from anyone
                        who has successfully landed positions at top tech companies. What was your preparation strategy?
                        Any specific resources you found helpful for technical interviews?
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="outline" className="text-xs font-normal">
                          internships
                        </Badge>
                        <Badge variant="outline" className="text-xs font-normal">
                          tech-interviews
                        </Badge>
                        <Badge variant="outline" className="text-xs font-normal">
                          career-advice
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>24 replies</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>18 likes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>42 views</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                        >
                          Hot
                        </Badge>
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="unanswered" className="mt-6">
              <div className="grid gap-4">
                {/* Unanswered threads would go here */}
                <Link href="/forum/networking-events" className="group">
                  <Card className="transition-all hover:border-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl group-hover:text-primary">
                            Upcoming networking events in NYC tech scene
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="@user5" />
                              <AvatarFallback>U5</AvatarFallback>
                            </Avatar>
                            <span>James Wilson</span>
                            <span>•</span>
                            <span>2 days ago</span>
                          </CardDescription>
                        </div>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-800/20 dark:text-green-400">
                          Events
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="line-clamp-2 text-muted-foreground">
                        I'm compiling a list of upcoming tech networking events in NYC for the next few months. So far I
                        have NY Tech Meetup, Startup Grind, and a few company-specific events. Anyone know of other good
                        events or communities worth joining? Especially interested in AI and fintech.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="outline" className="text-xs font-normal">
                          networking
                        </Badge>
                        <Badge variant="outline" className="text-xs font-normal">
                          nyc-tech
                        </Badge>
                        <Badge variant="outline" className="text-xs font-normal">
                          events
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>7 replies</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>11 likes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>29 views</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400"
                        >
                          New
                        </Badge>
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        <section className="container px-4 py-6 md:px-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Forum Categories</CardTitle>
                  <CardDescription>Browse discussions by category</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Academics</h3>
                      <p className="text-sm text-muted-foreground">
                        Discussions about courses, professors, and academic resources
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Career</h3>
                      <p className="text-sm text-muted-foreground">
                        Job hunting, internships, interviews, and career development
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-purple-800 dark:bg-purple-800/20 dark:text-purple-400">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Campus Life</h3>
                      <p className="text-sm text-muted-foreground">
                        Housing, social activities, and life at Cornell Tech
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-800 dark:bg-amber-800/20 dark:text-amber-400">
                      <Tag className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Technology</h3>
                      <p className="text-sm text-muted-foreground">
                        Tech trends, tools, programming, and technical discussions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Events</h3>
                      <p className="text-sm text-muted-foreground">
                        Campus events, meetups, conferences, and networking opportunities
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-800 dark:bg-orange-800/20 dark:text-orange-400">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">General</h3>
                      <p className="text-sm text-muted-foreground">
                        General discussions and topics that don't fit elsewhere
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Forum Stats</CardTitle>
                  <CardDescription>Community activity at a glance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Threads</span>
                    <span className="font-medium">248</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Posts</span>
                    <span className="font-medium">1,842</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Users</span>
                    <span className="font-medium">127</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">New Today</span>
                    <span className="font-medium">12</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View All Stats
                  </Button>
                </CardFooter>
              </Card>
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Top Contributors</CardTitle>
                  <CardDescription>Most active community members</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg?height=40&width=40" alt="@user1" />
                      <AvatarFallback>U1</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">Alex Johnson</p>
                      <p className="text-sm text-muted-foreground">42 posts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg?height=40&width=40" alt="@user2" />
                      <AvatarFallback>U2</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">Maya Patel</p>
                      <p className="text-sm text-muted-foreground">38 posts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg?height=40&width=40" alt="@user3" />
                      <AvatarFallback>U3</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">David Kim</p>
                      <p className="text-sm text-muted-foreground">31 posts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="container px-4 py-8 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Join the Conversation</h2>
              <p className="text-muted-foreground">
                Have a question or something to share? Start a new discussion thread.
              </p>
            </div>
            <Button className="gap-1">
              <PlusCircle className="h-4 w-4" />
              <span>Create New Thread</span>
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}

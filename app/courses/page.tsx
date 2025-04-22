import Link from "next/link"
import { Filter, Search, SortAsc, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CoursesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-16 bg-gradient-to-b from-red-50 to-white dark:from-red-950/20 dark:to-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Course Reviews</h1>
                <p className="max-w-[700px] text-muted-foreground md:text-xl">
                  Find and share reviews for Cornell Tech courses to help you make informed decisions.
                </p>
              </div>
              <div className="w-full max-w-2xl space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search courses by name, professor, or keyword..."
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
                      <SelectValue placeholder="Program" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Programs</SelectItem>
                      <SelectItem value="meng">MEng</SelectItem>
                      <SelectItem value="mba">MBA</SelectItem>
                      <SelectItem value="llm">LLM</SelectItem>
                      <SelectItem value="health">Health Tech</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="all">
                    <SelectTrigger className="h-8 w-[130px]">
                      <SelectValue placeholder="Semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Semesters</SelectItem>
                      <SelectItem value="fall2023">Fall 2023</SelectItem>
                      <SelectItem value="spring2023">Spring 2023</SelectItem>
                      <SelectItem value="fall2022">Fall 2022</SelectItem>
                      <SelectItem value="spring2022">Spring 2022</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="rating">
                    <SelectTrigger className="h-8 w-[130px]">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="reviews">Most Reviews</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="name">Course Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container px-4 py-6 md:px-6">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">All Courses</TabsTrigger>
                <TabsTrigger value="core">Core</TabsTrigger>
                <TabsTrigger value="technical">Technical</TabsTrigger>
                <TabsTrigger value="studio">Studio</TabsTrigger>
                <TabsTrigger value="business">Business</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1">
                  <SortAsc className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sort</span>
                </Button>
                <Button size="sm">Add Review</Button>
              </div>
            </div>

            <TabsContent value="all" className="mt-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Machine Learning Course Card */}
                <Link href="/courses/machine-learning" className="group">
                  <Card className="h-full overflow-hidden transition-all hover:border-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">Machine Learning</CardTitle>
                          <CardDescription className="text-sm">Prof. Serge Belongie</CardDescription>
                        </div>
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-800/20 dark:text-red-400">
                          Technical
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex items-center gap-1 text-sm">
                        <div className="flex">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-muted text-muted-foreground" />
                        </div>
                        <span className="font-medium">4.0</span>
                        <span className="text-muted-foreground">(24 reviews)</span>
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Difficulty</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div className="h-2 w-[75%] rounded-full bg-yellow-400"></div>
                            </div>
                            <span>7.5/10</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Workload</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div className="h-2 w-[80%] rounded-full bg-yellow-400"></div>
                            </div>
                            <span>8.0/10</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Value</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div className="h-2 w-[85%] rounded-full bg-yellow-400"></div>
                            </div>
                            <span>8.5/10</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-1">
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        "Great course that covers both theory and practical applications. Challenging but rewarding."
                      </p>
                    </CardFooter>
                  </Card>
                </Link>

                {/* Product Studio Course Card */}
                <Link href="/courses/product-studio" className="group">
                  <Card className="h-full overflow-hidden transition-all hover:border-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">Product Studio</CardTitle>
                          <CardDescription className="text-sm">Prof. David Tisch</CardDescription>
                        </div>
                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-800/20 dark:text-purple-400">
                          Studio
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex items-center gap-1 text-sm">
                        <div className="flex">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </div>
                        <span className="font-medium">4.9</span>
                        <span className="text-muted-foreground">(32 reviews)</span>
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Difficulty</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div className="h-2 w-[65%] rounded-full bg-yellow-400"></div>
                            </div>
                            <span>6.5/10</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Workload</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div className="h-2 w-[90%] rounded-full bg-yellow-400"></div>
                            </div>
                            <span>9.0/10</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Value</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div className="h-2 w-[95%] rounded-full bg-yellow-400"></div>
                            </div>
                            <span>9.5/10</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-1">
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        "The most valuable course at Cornell Tech. Real-world experience working with companies on
                        actual problems."
                      </p>
                    </CardFooter>
                  </Card>
                </Link>

                {/* Business Fundamentals Course Card */}
                <Link href="/courses/business-fundamentals" className="group">
                  <Card className="h-full overflow-hidden transition-all hover:border-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">Business Fundamentals</CardTitle>
                          <CardDescription className="text-sm">Prof. Michael Gruber</CardDescription>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-800/20 dark:text-blue-400">
                          Business
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex items-center gap-1 text-sm">
                        <div className="flex">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-muted text-muted-foreground" />
                        </div>
                        <span className="font-medium">4.2</span>
                        <span className="text-muted-foreground">(18 reviews)</span>
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Difficulty</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div className="h-2 w-[55%] rounded-full bg-yellow-400"></div>
                            </div>
                            <span>5.5/10</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Workload</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div className="h-2 w-[60%] rounded-full bg-yellow-400"></div>
                            </div>
                            <span>6.0/10</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Value</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div className="h-2 w-[80%] rounded-full bg-yellow-400"></div>
                            </div>
                            <span>8.0/10</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-1">
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        "Essential knowledge for tech entrepreneurs. Good balance of theory and practical case studies."
                      </p>
                    </CardFooter>
                  </Card>
                </Link>

                {/* HCI Course Card */}
                <Link href="/courses/hci" className="group">
                  <Card className="h-full overflow-hidden transition-all hover:border-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">Human-Computer Interaction</CardTitle>
                          <CardDescription className="text-sm">Prof. Wendy Ju</CardDescription>
                        </div>
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-800/20 dark:text-red-400">
                          Technical
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex items-center gap-1 text-sm">
                        <div className="flex">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </div>
                        <span className="font-medium">4.7</span>
                        <span className="text-muted-foreground">(15 reviews)</span>
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Difficulty</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div className="h-2 w-[60%] rounded-full bg-yellow-400"></div>
                            </div>
                            <span>6.0/10</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Workload</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div className="h-2 w-[70%] rounded-full bg-yellow-400"></div>
                            </div>
                            <span>7.0/10</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Value</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div className="h-2 w-[90%] rounded-full bg-yellow-400"></div>
                            </div>
                            <span>9.0/10</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-1">
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        "Fascinating course that changes how you think about design. Highly recommended for all
                        students."
                      </p>
                    </CardFooter>
                  </Card>
                </Link>

                {/* Startup Systems Course Card */}
                <Link href="/courses/startup-systems" className="group">
                  <Card className="h-full overflow-hidden transition-all hover:border-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">Startup Systems</CardTitle>
                          <CardDescription className="text-sm">Prof. Vitaly Shmatikov</CardDescription>
                        </div>
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-800/20 dark:text-red-400">
                          Technical
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex items-center gap-1 text-sm">
                        <div className="flex">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-muted text-muted-foreground" />
                          <Star className="h-4 w-4 fill-muted text-muted-foreground" />
                        </div>
                        <span className="font-medium">3.4</span>
                        <span className="text-muted-foreground">(22 reviews)</span>
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Difficulty</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div className="h-2 w-[85%] rounded-full bg-yellow-400"></div>
                            </div>
                            <span>8.5/10</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Workload</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div className="h-2 w-[90%] rounded-full bg-yellow-400"></div>
                            </div>
                            <span>9.0/10</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Value</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div className="h-2 w-[65%] rounded-full bg-yellow-400"></div>
                            </div>
                            <span>6.5/10</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-1">
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        "Very challenging course with a heavy workload. Good for those who want to dive deep into
                        systems."
                      </p>
                    </CardFooter>
                  </Card>
                </Link>

                {/* Leadership Course Card */}
                <Link href="/courses/leadership" className="group">
                  <Card className="h-full overflow-hidden transition-all hover:border-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">Leadership in Digital Transformation</CardTitle>
                          <CardDescription className="text-sm">Prof. Deborah Estrin</CardDescription>
                        </div>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-800/20 dark:text-green-400">
                          Core
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex items-center gap-1 text-sm">
                        <div className="flex">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-muted text-muted-foreground" />
                        </div>
                        <span className="font-medium">4.3</span>
                        <span className="text-muted-foreground">(19 reviews)</span>
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Difficulty</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div className="h-2 w-[50%] rounded-full bg-yellow-400"></div>
                            </div>
                            <span>5.0/10</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Workload</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div className="h-2 w-[55%] rounded-full bg-yellow-400"></div>
                            </div>
                            <span>5.5/10</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Value</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div className="h-2 w-[85%] rounded-full bg-yellow-400"></div>
                            </div>
                            <span>8.5/10</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-1">
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        "Insightful discussions and great guest speakers. Helps develop important soft skills for tech
                        leaders."
                      </p>
                    </CardFooter>
                  </Card>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="core" className="mt-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Core courses would go here */}
                <Link href="/courses/leadership" className="group">
                  <Card className="h-full overflow-hidden transition-all hover:border-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">Leadership in Digital Transformation</CardTitle>
                          <CardDescription className="text-sm">Prof. Deborah Estrin</CardDescription>
                        </div>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-800/20 dark:text-green-400">
                          Core
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex items-center gap-1 text-sm">
                        <div className="flex">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-muted text-muted-foreground" />
                        </div>
                        <span className="font-medium">4.3</span>
                        <span className="text-muted-foreground">(19 reviews)</span>
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Difficulty</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div className="h-2 w-[50%] rounded-full bg-yellow-400"></div>
                            </div>
                            <span>5.0/10</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Workload</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div className="h-2 w-[55%] rounded-full bg-yellow-400"></div>
                            </div>
                            <span>5.5/10</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Value</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div className="h-2 w-[85%] rounded-full bg-yellow-400"></div>
                            </div>
                            <span>8.5/10</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-1">
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        "Insightful discussions and great guest speakers. Helps develop important soft skills for tech
                        leaders."
                      </p>
                    </CardFooter>
                  </Card>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="technical" className="mt-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Technical courses would go here */}
                <Link href="/courses/machine-learning" className="group">
                  <Card className="h-full overflow-hidden transition-all hover:border-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">Machine Learning</CardTitle>
                          <CardDescription className="text-sm">Prof. Serge Belongie</CardDescription>
                        </div>
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-800/20 dark:text-red-400">
                          Technical
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex items-center gap-1 text-sm">
                        <div className="flex">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-muted text-muted-foreground" />
                        </div>
                        <span className="font-medium">4.0</span>
                        <span className="text-muted-foreground">(24 reviews)</span>
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Difficulty</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div className="h-2 w-[75%] rounded-full bg-yellow-400"></div>
                            </div>
                            <span>7.5/10</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Workload</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div className="h-2 w-[80%] rounded-full bg-yellow-400"></div>
                            </div>
                            <span>8.0/10</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Value</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div className="h-2 w-[85%] rounded-full bg-yellow-400"></div>
                            </div>
                            <span>8.5/10</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-1">
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        "Great course that covers both theory and practical applications. Challenging but rewarding."
                      </p>
                    </CardFooter>
                  </Card>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="studio" className="mt-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Studio courses would go here */}
                <Link href="/courses/product-studio" className="group">
                  <Card className="h-full overflow-hidden transition-all hover:border-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">Product Studio</CardTitle>
                          <CardDescription className="text-sm">Prof. David Tisch</CardDescription>
                        </div>
                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-800/20 dark:text-purple-400">
                          Studio
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex items-center gap-1 text-sm">
                        <div className="flex">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </div>
                        <span className="font-medium">4.9</span>
                        <span className="text-muted-foreground">(32 reviews)</span>
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Difficulty</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div className="h-2 w-[65%] rounded-full bg-yellow-400"></div>
                            </div>
                            <span>6.5/10</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Workload</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div className="h-2 w-[90%] rounded-full bg-yellow-400"></div>
                            </div>
                            <span>9.0/10</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Value</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div className="h-2 w-[95%] rounded-full bg-yellow-400"></div>
                            </div>
                            <span>9.5/10</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-1">
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        "The most valuable course at Cornell Tech. Real-world experience working with companies on
                        actual problems."
                      </p>
                    </CardFooter>
                  </Card>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="business" className="mt-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Business courses would go here */}
                <Link href="/courses/business-fundamentals" className="group">
                  <Card className="h-full overflow-hidden transition-all hover:border-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">Business Fundamentals</CardTitle>
                          <CardDescription className="text-sm">Prof. Michael Gruber</CardDescription>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-800/20 dark:text-blue-400">
                          Business
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex items-center gap-1 text-sm">
                        <div className="flex">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-muted text-muted-foreground" />
                        </div>
                        <span className="font-medium">4.2</span>
                        <span className="text-muted-foreground">(18 reviews)</span>
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Difficulty</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div className="h-2 w-[55%] rounded-full bg-yellow-400"></div>
                            </div>
                            <span>5.5/10</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Workload</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div className="h-2 w-[60%] rounded-full bg-yellow-400"></div>
                            </div>
                            <span>6.0/10</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Value</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div className="h-2 w-[80%] rounded-full bg-yellow-400"></div>
                            </div>
                            <span>8.0/10</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-1">
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        "Essential knowledge for tech entrepreneurs. Good balance of theory and practical case studies."
                      </p>
                    </CardFooter>
                  </Card>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        <section className="container px-4 py-8 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Can't find what you're looking for?</h2>
              <p className="text-muted-foreground">
                Help your fellow students by adding a review for a course that's not listed yet.
              </p>
            </div>
            <Button>Add a New Course Review</Button>
          </div>
        </section>
      </div>
    </div>
  )
}

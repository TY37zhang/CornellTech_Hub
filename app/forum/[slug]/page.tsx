import Link from "next/link"
import { ArrowLeft, BookmarkPlus, Flag, MessageSquare, Share2, ThumbsDown, ThumbsUp, SortAsc } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

export default function ThreadPage({ params }: { params: { slug: string } }) {
  // This would normally fetch data based on the slug
  const threadData = {
    id: "internship-tips",
    title: "Tips for landing summer internships at FAANG companies?",
    category: "Career",
    author: {
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      program: "MEng CS",
      joinDate: "Sep 2023",
    },
    createdAt: "2 days ago",
    content:
      "I'm starting to prepare for summer internship applications and would love to hear from anyone who has successfully landed positions at top tech companies. What was your preparation strategy? Any specific resources you found helpful for technical interviews?\n\nI've been practicing on LeetCode and reading Cracking the Coding Interview, but I'm wondering if there are other resources I should be using. Also, how early should I start applying? I've heard some companies open applications as early as August for the following summer.\n\nAny advice on resume formatting specifically for tech companies would also be appreciated. Thanks in advance!",
    tags: ["internships", "tech-interviews", "career-advice"],
    stats: {
      replies: 24,
      likes: 18,
      views: 42,
    },
    replies: [
      {
        id: 1,
        author: {
          name: "Emily Zhang",
          avatar: "/placeholder.svg?height=40&width=40",
          program: "MEng CS",
          joinDate: "Aug 2022",
        },
        createdAt: "2 days ago",
        content:
          'I interned at Google last summer and can share what worked for me. First, start applying EARLY - like August/September for the following summer. Many companies fill spots on a rolling basis.\n\nFor technical prep, I found the following resources helpful:\n\n1. LeetCode Premium (worth it for the company-specific questions)\n2. Grokking the Coding Interview course\n3. Mock interviews with friends or platforms like Pramp\n\nBeyond technical skills, make sure your resume highlights projects with measurable impact. For each project or experience, try to include metrics (e.g., "reduced processing time by 40%").\n\nAlso, don\'t underestimate the importance of behavioral interviews. Prepare stories about teamwork, overcoming challenges, etc. using the STAR method.',
        likes: 12,
        isAccepted: true,
      },
      {
        id: 2,
        author: {
          name: "Michael Rodriguez",
          avatar: "/placeholder.svg?height=40&width=40",
          program: "MBA Tech",
          joinDate: "Jan 2023",
        },
        createdAt: "1 day ago",
        content:
          'Coming from a non-traditional background (I was in finance before my MBA), I landed an internship at Amazon last summer. My approach was a bit different since I had to emphasize my transferable skills.\n\nI\'d add that networking is CRUCIAL. I attended every tech recruiting event I could find and made connections on LinkedIn with Cornell Tech alumni at my target companies. Several of them referred me, which significantly increased my chances of getting interviews.\n\nFor technical interviews, I found the book "System Design Interview" by Alex Xu very helpful in addition to the resources Emily mentioned.',
        likes: 8,
      },
      {
        id: 3,
        author: {
          name: "Sophia Lee",
          avatar: "/placeholder.svg?height=40&width=40",
          program: "MEng CS",
          joinDate: "Sep 2022",
        },
        createdAt: "1 day ago",
        content:
          "Facebook (Meta) intern here! One thing I'd add is to tailor your resume and cover letter for each company. Research their values and culture, and try to align your experiences with what they care about.\n\nAlso, practice coding on a whiteboard or Google Doc without syntax highlighting or autocomplete. Many interviews still happen this way, and it's a very different experience from coding in your IDE.\n\nLastly, don't get discouraged by rejections. The process is highly competitive and sometimes a bit random. I was rejected by smaller companies but accepted at Meta. Apply widely!",
        likes: 10,
      },
    ],
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <section className="w-full py-12 md:py-16 lg:py-12 bg-gradient-to-b from-red-50 to-white dark:from-red-950/20 dark:to-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/forum">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back to forum</span>
                  </Link>
                </Button>
                <p className="text-sm text-muted-foreground">Back to forum</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-800/20 dark:text-blue-400">
                    {threadData.category}
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{threadData.title}</h1>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>Posted by {threadData.author.name}</span>
                  <span>•</span>
                  <span>{threadData.createdAt}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{threadData.stats.replies} replies</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{threadData.stats.likes} likes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container px-4 py-6 md:px-6">
          <div className="grid gap-6 md:grid-cols-[1fr_300px]">
            <div className="space-y-6">
              {/* Original Post */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={threadData.author.avatar || "/placeholder.svg"}
                          alt={threadData.author.name}
                        />
                        <AvatarFallback>{threadData.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{threadData.author.name}</CardTitle>
                        <CardDescription>
                          {threadData.author.program} • Joined {threadData.author.joinDate}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">{threadData.createdAt}</div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-4">
                    <div className="whitespace-pre-line text-muted-foreground">{threadData.content}</div>
                    <div className="flex flex-wrap gap-2">
                      {threadData.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs font-normal">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      <span>Like</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Share2 className="h-4 w-4" />
                      <span>Share</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <BookmarkPlus className="h-4 w-4" />
                      <span>Save</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Flag className="h-4 w-4" />
                      <span>Report</span>
                    </Button>
                  </div>
                </CardFooter>
              </Card>

              {/* Replies */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold tracking-tight">
                    {threadData.stats.replies} {threadData.stats.replies === 1 ? "Reply" : "Replies"}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1">
                      <SortAsc className="h-3.5 w-3.5" />
                      <span>Sort</span>
                    </Button>
                  </div>
                </div>

                {threadData.replies.map((reply) => (
                  <Card key={reply.id} className={reply.isAccepted ? "border-green-500 dark:border-green-700" : ""}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={reply.author.avatar || "/placeholder.svg"} alt={reply.author.name} />
                            <AvatarFallback>{reply.author.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base">{reply.author.name}</CardTitle>
                            <CardDescription>
                              {reply.author.program} • Joined {reply.author.joinDate}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {reply.isAccepted && (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-800/20 dark:text-green-400">
                              Best Answer
                            </Badge>
                          )}
                          <span className="text-sm text-muted-foreground">{reply.createdAt}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="whitespace-pre-line text-muted-foreground">{reply.content}</div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{reply.likes}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <ThumbsDown className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Share2 className="h-4 w-4" />
                          <span>Share</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Flag className="h-4 w-4" />
                          <span>Report</span>
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {/* Reply Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Post a Reply</CardTitle>
                  <CardDescription>Share your thoughts or answer the question</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea placeholder="Write your reply here..." className="min-h-[150px]" />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Cancel</Button>
                  <Button>Post Reply</Button>
                </CardFooter>
              </Card>
            </div>

            <div className="space-y-6">
              {/* About the Author */}
              <Card>
                <CardHeader>
                  <CardTitle>About the Author</CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={threadData.author.avatar || "/placeholder.svg"} alt={threadData.author.name} />
                      <AvatarFallback>{threadData.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{threadData.author.name}</p>
                      <p className="text-sm text-muted-foreground">{threadData.author.program}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Member Since</span>
                      <span>{threadData.author.joinDate}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Posts</span>
                      <span>42</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Reputation</span>
                      <span>156</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View Profile
                  </Button>
                </CardFooter>
              </Card>

              {/* Related Threads */}
              <Card>
                <CardHeader>
                  <CardTitle>Related Threads</CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <Link href="#" className="font-medium hover:text-primary">
                        Resume review for tech internships
                      </Link>
                      <p className="text-xs text-muted-foreground">15 replies • 3 days ago</p>
                    </div>
                    <div className="space-y-1">
                      <Link href="#" className="font-medium hover:text-primary">
                        How to prepare for system design interviews
                      </Link>
                      <p className="text-xs text-muted-foreground">8 replies • 1 week ago</p>
                    </div>
                    <div className="space-y-1">
                      <Link href="#" className="font-medium hover:text-primary">
                        Negotiating internship offers
                      </Link>
                      <p className="text-xs text-muted-foreground">12 replies • 2 weeks ago</p>
                    </div>
                    <div className="space-y-1">
                      <Link href="#" className="font-medium hover:text-primary">
                        Best companies for remote internships
                      </Link>
                      <p className="text-xs text-muted-foreground">19 replies • 3 weeks ago</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View More
                  </Button>
                </CardFooter>
              </Card>

              {/* Forum Guidelines */}
              <Card>
                <CardHeader>
                  <CardTitle>Forum Guidelines</CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Be respectful and constructive in your responses</p>
                    <p>• Stay on topic and avoid unnecessary tangents</p>
                    <p>• Do not share personal or sensitive information</p>
                    <p>• Cite sources when providing factual information</p>
                    <p>• Report inappropriate content to moderators</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

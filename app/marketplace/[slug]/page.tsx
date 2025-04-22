import Link from "next/link"
import { ArrowLeft, Heart, Share2, Flag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ItemDetailPage({ params }: { params: { slug: string } }) {
  // This would normally fetch data based on the slug
  const itemData = {
    id: "macbook-pro",
    title: "MacBook Pro (2022) - M1 Pro",
    description:
      'MacBook Pro 14" (2022) with M1 Pro chip, 16GB RAM, 512GB SSD. Used for 6 months, excellent condition with original box and accessories. Perfect for CS students.\n\nSpecs:\n- 14-inch Liquid Retina XDR display\n- Apple M1 Pro chip with 8-core CPU and 14-core GPU\n- 16GB unified memory\n- 512GB SSD storage\n- 1080p FaceTime HD camera\n- Three Thunderbolt 4 ports\n- HDMI port\n- SDXC card slot\n- MagSafe 3 charging port\n\nIncludes:\n- Original box and packaging\n- USB-C to MagSafe 3 Cable (2 m)\n- 67W USB-C Power Adapter\n- Apple stickers\n\nReason for selling: Upgrading to a more powerful model for video editing work. This laptop is in excellent condition with no scratches or dents. Battery health at 97% with only 42 charging cycles.',
    price: "$1,200",
    originalPrice: "$1,999",
    condition: "Like New",
    category: "Electronics",
    images: [
      "/placeholder.svg?height=600&width=800",
      "/placeholder.svg?height=600&width=800",
      "/placeholder.svg?height=600&width=800",
      "/placeholder.svg?height=600&width=800",
    ],
    location: "Cornell Tech Campus",
    postedAt: "2 days ago",
    seller: {
      name: "Michael Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      program: "MEng CS",
      joinDate: "Sep 2023",
      rating: 4.8,
      totalSales: 7,
    },
    stats: {
      views: 42,
      saves: 18,
      inquiries: 5,
    },
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <section className="w-full py-12 md:py-16 lg:py-12 bg-gradient-to-b from-red-50 to-white dark:from-red-950/20 dark:to-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/marketplace">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back to marketplace</span>
                  </Link>
                </Button>
                <p className="text-sm text-muted-foreground">Back to marketplace</p>
              </div>
              <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-800/20 dark:text-green-400">
                        {itemData.condition}
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-800/20 dark:text-blue-400">
                        {itemData.category}
                      </Badge>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{itemData.title}</h1>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{itemData.price}</span>
                      {itemData.originalPrice && (
                        <span className="text-lg text-muted-foreground line-through">{itemData.originalPrice}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span>Posted {itemData.postedAt}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Location: {itemData.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container px-4 py-6 md:px-6">
          <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              {/* Item Images */}
              <Card>
                <CardContent className="p-0">
                  <Tabs defaultValue="image-0" className="w-full">
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <TabsContent value="image-0" className="absolute inset-0 m-0">
                        <img
                          src={itemData.images[0] || "/placeholder.svg"}
                          alt={`${itemData.title} - Image 1`}
                          className="h-full w-full object-cover"
                        />
                      </TabsContent>
                      <TabsContent value="image-1" className="absolute inset-0 m-0">
                        <img
                          src={itemData.images[1] || "/placeholder.svg"}
                          alt={`${itemData.title} - Image 2`}
                          className="h-full w-full object-cover"
                        />
                      </TabsContent>
                      <TabsContent value="image-2" className="absolute inset-0 m-0">
                        <img
                          src={itemData.images[2] || "/placeholder.svg"}
                          alt={`${itemData.title} - Image 3`}
                          className="h-full w-full object-cover"
                        />
                      </TabsContent>
                      <TabsContent value="image-3" className="absolute inset-0 m-0">
                        <img
                          src={itemData.images[3] || "/placeholder.svg"}
                          alt={`${itemData.title} - Image 4`}
                          className="h-full w-full object-cover"
                        />
                      </TabsContent>
                    </div>
                    <div className="flex items-center justify-center p-2 bg-background">
                      <TabsList className="p-0 bg-transparent">
                        {itemData.images.map((image, index) => (
                          <TabsTrigger
                            key={`image-${index}`}
                            value={`image-${index}`}
                            className="rounded-md overflow-hidden h-20 w-20 p-0 m-1 data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:ring-0"
                          >
                            <img
                              src={image || "/placeholder.svg"}
                              alt={`Thumbnail ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Item Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="whitespace-pre-line text-muted-foreground">{itemData.description}</div>
                </CardContent>
              </Card>

              {/* Item Actions */}
              <div className="flex flex-wrap gap-3">
                <Button className="flex-1" size="lg">
                  Contact Seller
                </Button>
                <Button variant="outline" size="lg" className="flex-1 gap-1">
                  <Heart className="h-4 w-4" />
                  <span>Save</span>
                </Button>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <Share2 className="h-4 w-4" />
                  <span className="sr-only">Share</span>
                </Button>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <Flag className="h-4 w-4" />
                  <span className="sr-only">Report</span>
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Seller Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Seller Information</CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={itemData.seller.avatar || "/placeholder.svg"} alt={itemData.seller.name} />
                      <AvatarFallback>{itemData.seller.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{itemData.seller.name}</p>
                      <p className="text-sm text-muted-foreground">{itemData.seller.program}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Member Since</span>
                      <span>{itemData.seller.joinDate}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Seller Rating</span>
                      <span>{itemData.seller.rating}/5.0 ★</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Items Sold</span>
                      <span>{itemData.seller.totalSales}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View Profile
                  </Button>
                </CardFooter>
              </Card>

              {/* Item Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Item Stats</CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Views</span>
                      <span>{itemData.stats.views}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Saves</span>
                      <span>{itemData.stats.saves}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Inquiries</span>
                      <span>{itemData.stats.inquiries}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Safety Tips */}
              <Card>
                <CardHeader>
                  <CardTitle>Safety Tips</CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Meet in public places on campus</p>
                    <p>• Don't share personal financial information</p>
                    <p>• Inspect items before purchasing</p>
                    <p>• Use Cornell Tech email for communication</p>
                    <p>• Report suspicious listings to administrators</p>
                  </div>
                </CardContent>
              </Card>

              {/* Similar Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Similar Items</CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <img
                        src="/placeholder.svg?height=60&width=60"
                        alt="Similar Item 1"
                        className="h-15 w-15 rounded-md object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">MacBook Air M2 (2023)</p>
                        <p className="text-sm text-muted-foreground">$950</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex gap-3">
                      <img
                        src="/placeholder.svg?height=60&width=60"
                        alt="Similar Item 2"
                        className="h-15 w-15 rounded-md object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">Dell XPS 13 (2022)</p>
                        <p className="text-sm text-muted-foreground">$800</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex gap-3">
                      <img
                        src="/placeholder.svg?height=60&width=60"
                        alt="Similar Item 3"
                        className="h-15 w-15 rounded-md object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">Microsoft Surface Laptop 5</p>
                        <p className="text-sm text-muted-foreground">$780</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View More
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        <section className="container px-4 py-8 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Interested in similar items?</h2>
              <p className="text-muted-foreground">
                Browse more listings in the electronics category or post your own item for sale.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" asChild>
                <Link href="/marketplace?category=electronics">Browse Electronics</Link>
              </Button>
              <Button>Post an Item</Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

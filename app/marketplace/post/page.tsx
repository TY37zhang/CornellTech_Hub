"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ImagePlus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

export default function PostItemPage() {
  const [images, setImages] = useState<string[]>([])
  const [previewImages, setPreviewImages] = useState<string[]>([
    "/placeholder.svg?height=200&width=200",
    "/placeholder.svg?height=200&width=200",
  ])

  const removeImage = (index: number) => {
    setPreviewImages(previewImages.filter((_, i) => i !== index))
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
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Post an Item</h1>
                <p className="text-muted-foreground md:text-xl">
                  List your item for sale in the Cornell Tech student marketplace
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="container px-4 py-6 md:px-6">
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
              <CardDescription>Provide detailed information about the item you're selling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Enter a descriptive title for your item" />
                <p className="text-xs text-muted-foreground">Be specific with brand, model, size, and condition</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="textbooks">Textbooks</SelectItem>
                    <SelectItem value="furniture">Furniture</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select>
                  <SelectTrigger id="condition">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="like-new">Like New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <div className="flex gap-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                    <Input id="price" type="number" min="0" step="0.01" className="pl-8" placeholder="0.00" />
                  </div>
                  <div className="flex-1">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Price type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Price</SelectItem>
                        <SelectItem value="negotiable">Negotiable</SelectItem>
                        <SelectItem value="free">Free</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your item in detail - include features, age, reason for selling, etc."
                  className="min-h-[200px]"
                />
                <p className="text-xs text-muted-foreground">Be honest about any flaws or issues with the item</p>
              </div>

              <div className="space-y-2">
                <Label>Photos</Label>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {previewImages.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-md border overflow-hidden">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Item preview ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove image</span>
                      </Button>
                    </div>
                  ))}
                  <div className="aspect-square border-2 border-dashed rounded-md flex flex-col items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors cursor-pointer">
                    <ImagePlus className="h-10 w-10 mb-2" />
                    <span className="text-sm font-medium">Add Photo</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Add up to 8 photos. Clear images from multiple angles will help your item sell faster.
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="location">Pickup Location</Label>
                <Select defaultValue="campus">
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="campus">Cornell Tech Campus</SelectItem>
                    <SelectItem value="house">The House Residence</SelectItem>
                    <SelectItem value="roosevelt">Roosevelt Island</SelectItem>
                    <SelectItem value="manhattan">Manhattan</SelectItem>
                    <SelectItem value="brooklyn">Brooklyn</SelectItem>
                    <SelectItem value="queens">Queens</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Preferred Contact Method</Label>
                <Select defaultValue="email">
                  <SelectTrigger id="contact">
                    <SelectValue placeholder="Select contact method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Cornell Email</SelectItem>
                    <SelectItem value="phone">Phone/Text</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="telegram">Telegram</SelectItem>
                    <SelectItem value="signal">Signal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="terms" className="h-4 w-4" />
                  <Label htmlFor="terms" className="text-sm font-normal">
                    I agree to the{" "}
                    <Link href="#" className="text-primary hover:underline">
                      marketplace guidelines
                    </Link>{" "}
                    and confirm this item belongs to me
                  </Label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/marketplace">Cancel</Link>
              </Button>
              <Button>Post Item</Button>
            </CardFooter>
          </Card>
        </section>
      </div>
    </div>
  )
}

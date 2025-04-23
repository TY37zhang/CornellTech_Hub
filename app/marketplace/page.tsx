"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Filter, Heart, PlusCircle, Search } from "lucide-react";

// Define item type
interface Item {
    id: string;
    title: string;
    seller: {
        name: string;
        avatar: string;
        initials: string;
    };
    price: number;
    description: string;
    category: string;
    condition: string;
    conditionColor: string;
    image: string;
    postedAt: string;
}

// Sample item data
const itemsData: Item[] = [
    {
        id: "macbook-pro",
        title: "MacBook Pro (2022) - M1 Pro",
        seller: {
            name: "Michael Johnson",
            avatar: "/placeholder.svg?height=32&width=32",
            initials: "MJ",
        },
        price: 1200,
        description:
            'MacBook Pro 14" (2022) with M1 Pro chip, 16GB RAM, 512GB SSD. Used for 6 months, excellent condition with original box and accessories. Perfect for CS students.',
        category: "electronics",
        condition: "Like New",
        conditionColor:
            "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-800/20 dark:text-green-400",
        image: "/placeholder.svg?height=400&width=600",
        postedAt: "2 days ago",
    },
    {
        id: "textbooks-bundle",
        title: "Textbooks Bundle - MBA Essentials",
        seller: {
            name: "Sarah Parker",
            avatar: "/placeholder.svg?height=32&width=32",
            initials: "SP",
        },
        price: 85,
        description:
            "Complete set of MBA textbooks including Business Fundamentals, Marketing Strategy, and Financial Accounting. Minor highlighting, all in good condition. Save over $200 compared to bookstore prices.",
        category: "textbooks",
        condition: "Good",
        conditionColor:
            "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-800/20 dark:text-blue-400",
        image: "/placeholder.svg?height=400&width=600",
        postedAt: "1 week ago",
    },
    {
        id: "desk-chair",
        title: "Ergonomic Desk Chair",
        seller: {
            name: "Alex Lee",
            avatar: "/placeholder.svg?height=32&width=32",
            initials: "AL",
        },
        price: 50,
        description:
            "Comfortable ergonomic desk chair, perfect for long study sessions. Adjustable height and lumbar support. Some visible wear but still very functional. Pickup only from The House.",
        category: "furniture",
        condition: "Good",
        conditionColor:
            "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-800/20 dark:text-blue-400",
        image: "/placeholder.svg?height=400&width=600",
        postedAt: "3 days ago",
    },
    {
        id: "ipad-pro",
        title: 'iPad Pro 11" (2022) with Apple Pencil',
        seller: {
            name: "Jamie Wong",
            avatar: "/placeholder.svg?height=32&width=32",
            initials: "JW",
        },
        price: 650,
        description:
            'iPad Pro 11" (2022) with M1 chip, 256GB, WiFi, Space Gray. Includes Apple Pencil 2nd gen and Magic Keyboard. Perfect for note-taking and design work. Only 5 months old with AppleCare+ until 2024.',
        category: "electronics",
        condition: "Like New",
        conditionColor:
            "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-800/20 dark:text-green-400",
        image: "/placeholder.svg?height=400&width=600",
        postedAt: "1 day ago",
    },
    {
        id: "winter-jacket",
        title: "North Face Winter Jacket - Men's M",
        seller: {
            name: "David Kim",
            avatar: "/placeholder.svg?height=32&width=32",
            initials: "DK",
        },
        price: 120,
        description:
            "Men's North Face McMurdo Parka, size Medium. Purchased last winter and barely used. Extremely warm, perfect for NYC winters. Waterproof and windproof. Original price was $350.",
        category: "clothing",
        condition: "Like New",
        conditionColor:
            "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-800/20 dark:text-green-400",
        image: "/placeholder.svg?height=400&width=600",
        postedAt: "4 days ago",
    },
    {
        id: "desk-lamp",
        title: "LED Desk Lamp with Wireless Charging",
        seller: {
            name: "Maya Patel",
            avatar: "/placeholder.svg?height=32&width=32",
            initials: "MP",
        },
        price: 25,
        description:
            "Modern LED desk lamp with multiple brightness settings and color temperatures. Built-in wireless charging pad for smartphones. USB port for additional charging. Works perfectly.",
        category: "electronics",
        condition: "Good",
        conditionColor:
            "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-800/20 dark:text-blue-400",
        image: "/placeholder.svg?height=400&width=600",
        postedAt: "1 week ago",
    },
    {
        id: "monitor",
        title: 'Dell 27" 4K Monitor',
        seller: {
            name: "Ryan Jones",
            avatar: "/placeholder.svg?height=32&width=32",
            initials: "RJ",
        },
        price: 180,
        description:
            'Dell UltraSharp 27" 4K USB-C Monitor (U2720Q). Great for programming and design work. Includes HDMI and USB-C cables. Two years old but in excellent working condition with no dead pixels.',
        category: "electronics",
        condition: "Good",
        conditionColor:
            "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-800/20 dark:text-blue-400",
        image: "/placeholder.svg?height=400&width=600",
        postedAt: "5 days ago",
    },
    {
        id: "bicycle",
        title: "City Bike - Trek FX1",
        seller: {
            name: "Lisa Chen",
            avatar: "/placeholder.svg?height=32&width=32",
            initials: "LC",
        },
        price: 150,
        description:
            "Trek FX1 hybrid bike, medium frame. Great for commuting around NYC. Some scratches and normal wear, but mechanically sound. Recently tuned up with new brake pads. Includes lock and helmet.",
        category: "other",
        condition: "Fair",
        conditionColor:
            "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-800/20 dark:text-amber-400",
        image: "/placeholder.svg?height=400&width=600",
        postedAt: "2 weeks ago",
    },
];

export default function MarketplacePage() {
    // State for search and filters
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [conditionFilter, setConditionFilter] = useState("all");
    const [sortBy, setSortBy] = useState("date");
    const [activeTab, setActiveTab] = useState("all");

    // Filtered and sorted items
    const [filteredItems, setFilteredItems] = useState<Item[]>(itemsData);

    // Apply filters and sorting whenever dependencies change
    useEffect(() => {
        let result = [...itemsData];

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (item) =>
                    item.title.toLowerCase().includes(query) ||
                    item.description.toLowerCase().includes(query) ||
                    item.category.toLowerCase().includes(query)
            );
        }

        // Apply category filter (tab)
        if (activeTab !== "all") {
            result = result.filter((item) => item.category === activeTab);
        }

        // Apply category filter (dropdown)
        if (categoryFilter !== "all") {
            result = result.filter((item) => item.category === categoryFilter);
        }

        // Apply condition filter
        if (conditionFilter !== "all") {
            const conditionMap: Record<string, string> = {
                new: "New",
                "like-new": "Like New",
                good: "Good",
                fair: "Fair",
                poor: "Poor",
            };
            result = result.filter(
                (item) => item.condition === conditionMap[conditionFilter]
            );
        }

        // Apply sorting
        result.sort((a, b) => {
            switch (sortBy) {
                case "date":
                    // Sort by recency (in a real app, you would use actual timestamps)
                    return a.postedAt.includes("day") ? -1 : 1;
                case "price-low":
                    return a.price - b.price;
                case "price-high":
                    return b.price - a.price;
                case "popular":
                    // In a real app, you would sort by popularity metrics
                    return 0;
                default:
                    return 0;
            }
        });

        setFilteredItems(result);
    }, [searchQuery, categoryFilter, conditionFilter, sortBy, activeTab]);

    return (
        <div className="flex min-h-screen flex-col">
            <div className="flex-1">
                <section className="w-full py-12 md:py-24 lg:py-16 bg-gradient-to-b from-red-50 to-white dark:from-red-950/20 dark:to-background">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                    Student Marketplace
                                </h1>
                                <p className="max-w-[700px] text-muted-foreground md:text-xl">
                                    Buy, sell, or trade items with the Cornell
                                    Tech community
                                </p>
                            </div>
                            <div className="w-full max-w-2xl space-y-2">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search items, textbooks, electronics, furniture..."
                                        className="w-full bg-background pl-8 rounded-md border"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                    />
                                </div>
                                {/* <div className="flex flex-wrap items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 gap-1"
                                    >
                                        <Filter className="h-3.5 w-3.5" />
                                        <span>Filters</span>
                                    </Button>
                                    <Select
                                        value={categoryFilter}
                                        onValueChange={setCategoryFilter}
                                    >
                                        <SelectTrigger className="h-8 w-[130px]">
                                            <SelectValue placeholder="Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Categories
                                            </SelectItem>
                                            <SelectItem value="electronics">
                                                Electronics
                                            </SelectItem>
                                            <SelectItem value="textbooks">
                                                Textbooks
                                            </SelectItem>
                                            <SelectItem value="furniture">
                                                Furniture
                                            </SelectItem>
                                            <SelectItem value="clothing">
                                                Clothing
                                            </SelectItem>
                                            <SelectItem value="other">
                                                Other
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        value={conditionFilter}
                                        onValueChange={setConditionFilter}
                                    >
                                        <SelectTrigger className="h-8 w-[130px]">
                                            <SelectValue placeholder="Condition" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Conditions
                                            </SelectItem>
                                            <SelectItem value="new">
                                                New
                                            </SelectItem>
                                            <SelectItem value="like-new">
                                                Like New
                                            </SelectItem>
                                            <SelectItem value="good">
                                                Good
                                            </SelectItem>
                                            <SelectItem value="fair">
                                                Fair
                                            </SelectItem>
                                            <SelectItem value="poor">
                                                Poor
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        value={sortBy}
                                        onValueChange={setSortBy}
                                    >
                                        <SelectTrigger className="h-8 w-[130px]">
                                            <SelectValue placeholder="Sort By" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="date">
                                                Most Recent
                                            </SelectItem>
                                            <SelectItem value="price-low">
                                                Price: Low to High
                                            </SelectItem>
                                            <SelectItem value="price-high">
                                                Price: High to Low
                                            </SelectItem>
                                            <SelectItem value="popular">
                                                Most Popular
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div> */}
                                {/* filter option removed */}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="container px-4 py-6 md:px-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold tracking-tight">
                            Browse Items
                        </h2>
                    </div>

                    <Tabs
                        defaultValue="all"
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                    >
                        <div className="flex items-center justify-between">
                            <TabsList>
                                <TabsTrigger value="all">All Items</TabsTrigger>
                                <TabsTrigger value="electronics">
                                    Electronics
                                </TabsTrigger>
                                <TabsTrigger value="textbooks">
                                    Textbooks
                                </TabsTrigger>
                                <TabsTrigger value="furniture">
                                    Furniture
                                </TabsTrigger>
                                <TabsTrigger value="clothing">
                                    Clothing
                                </TabsTrigger>
                            </TabsList>
                            <div className="flex items-center gap-2">
                                <Button className="gap-1">
                                    <PlusCircle className="h-4 w-4" />
                                    <span>Post an Item</span>
                                </Button>
                            </div>
                        </div>

                        <TabsContent value="all" className="mt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredItems.length > 0 ? (
                                    filteredItems.map((item) => (
                                        <Link
                                            href={`/marketplace/${item.id}`}
                                            key={item.id}
                                            className="group"
                                        >
                                            <Card className="h-full overflow-hidden transition-all hover:border-primary">
                                                <div className="aspect-[4/3] relative overflow-hidden">
                                                    <img
                                                        src={
                                                            item.image ||
                                                            "/placeholder.svg"
                                                        }
                                                        alt={item.title}
                                                        className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
                                                    />
                                                    <div className="absolute right-2 top-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                                                        >
                                                            <Heart className="h-4 w-4" />
                                                            <span className="sr-only">
                                                                Add to favorites
                                                            </span>
                                                        </Button>
                                                    </div>
                                                    <div className="absolute left-2 top-2">
                                                        <Badge
                                                            className={
                                                                item.conditionColor
                                                            }
                                                        >
                                                            {item.condition}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <CardHeader className="p-4 pb-2">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <CardTitle className="text-lg group-hover:text-primary">
                                                                {item.title}
                                                            </CardTitle>
                                                            <CardDescription className="flex items-center gap-2 mt-1">
                                                                <Avatar className="h-5 w-5">
                                                                    <AvatarImage
                                                                        src={
                                                                            item
                                                                                .seller
                                                                                .avatar ||
                                                                            "/placeholder.svg"
                                                                        }
                                                                        alt={`@${item.seller.name}`}
                                                                    />
                                                                    <AvatarFallback>
                                                                        {
                                                                            item
                                                                                .seller
                                                                                .initials
                                                                        }
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <span>
                                                                    {
                                                                        item
                                                                            .seller
                                                                            .name
                                                                    }
                                                                </span>
                                                            </CardDescription>
                                                        </div>
                                                        <span className="font-bold text-lg">
                                                            ${item.price}
                                                        </span>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="p-4 pt-0 pb-2">
                                                    <p className="line-clamp-2 text-sm text-muted-foreground">
                                                        {item.description}
                                                    </p>
                                                </CardContent>
                                                <CardFooter className="p-4 pt-0 flex items-center justify-between">
                                                    <Badge variant="outline">
                                                        {item.category
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            item.category.slice(
                                                                1
                                                            )}
                                                    </Badge>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <span>
                                                            Posted{" "}
                                                            {item.postedAt}
                                                        </span>
                                                    </div>
                                                </CardFooter>
                                            </Card>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-10">
                                        <p className="text-muted-foreground">
                                            No items found matching your search
                                            criteria.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="electronics" className="mt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {/* Electronics items content is handled by the filtered items in the "all" tab */}
                            </div>
                        </TabsContent>

                        <TabsContent value="textbooks" className="mt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {/* Textbooks items content is handled by the filtered items in the "all" tab */}
                            </div>
                        </TabsContent>

                        <TabsContent value="furniture" className="mt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {/* Furniture items content is handled by the filtered items in the "all" tab */}
                            </div>
                        </TabsContent>

                        <TabsContent value="clothing" className="mt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {/* Clothing items content is handled by the filtered items in the "all" tab */}
                            </div>
                        </TabsContent>
                    </Tabs>
                </section>

                <section className="container px-4 py-6 md:px-6">
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="md:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Marketplace Guidelines
                                    </CardTitle>
                                    <CardDescription>
                                        Please follow these guidelines when
                                        buying or selling
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <h3 className="font-semibold text-foreground">
                                            For Sellers
                                        </h3>
                                        <p>
                                            • Provide accurate descriptions and
                                            clear photos
                                        </p>
                                        <p>
                                            • Price items fairly based on
                                            condition and age
                                        </p>
                                        <p>
                                            • Respond to inquiries within 24
                                            hours
                                        </p>
                                        <p>
                                            • Meet buyers in public places for
                                            safety
                                        </p>
                                        <p>
                                            • Remove listings once items are
                                            sold
                                        </p>
                                    </div>
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <h3 className="font-semibold text-foreground">
                                            For Buyers
                                        </h3>
                                        <p>• Inspect items before purchasing</p>
                                        <p>
                                            • Ask questions about condition and
                                            history
                                        </p>
                                        <p>
                                            • Use university email for
                                            communication
                                        </p>
                                        <p>
                                            • Meet in public places for safety
                                        </p>
                                        <p>
                                            • Report suspicious listings to
                                            administrators
                                        </p>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                    >
                                        View Full Guidelines
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                        <div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Popular Categories</CardTitle>
                                    <CardDescription>
                                        Most searched items this semester
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">
                                            Laptops & Computers
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            36 items
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">
                                            Furniture
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            24 items
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">
                                            Textbooks
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            19 items
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">
                                            Electronics
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            15 items
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">
                                            Winter Clothing
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            12 items
                                        </span>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                    >
                                        View All Categories
                                    </Button>
                                </CardFooter>
                            </Card>
                            <Card className="mt-4">
                                <CardHeader>
                                    <CardTitle>Marketplace Stats</CardTitle>
                                    <CardDescription>
                                        Community activity at a glance
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Total Items
                                        </span>
                                        <span className="font-medium">186</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Active Sellers
                                        </span>
                                        <span className="font-medium">73</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Items Sold (30 days)
                                        </span>
                                        <span className="font-medium">92</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            New Today
                                        </span>
                                        <span className="font-medium">8</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                <section className="container px-4 py-8 md:px-6">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight">
                                Have Something to Sell?
                            </h2>
                            <p className="text-muted-foreground">
                                Post your unused items and earn some extra cash
                                while helping fellow students find what they
                                need.
                            </p>
                        </div>
                        <Button className="gap-1">
                            <PlusCircle className="h-4 w-4" />
                            <span>Post an Item</span>
                        </Button>
                    </div>
                </section>
            </div>
        </div>
    );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQPage() {
    return (
        <div className="container py-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">
                    Frequently Asked Questions
                </h1>
                <p className="text-muted-foreground mb-8">
                    Find answers to common questions about the Cornell Tech Hub
                    platform.
                </p>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>
                            What is Cornell Tech Hub?
                        </AccordionTrigger>
                        <AccordionContent>
                            Cornell Tech Hub is a student-built platform
                            designed to help Cornell Tech students access and
                            share resources, connect with peers, and stay
                            informed about campus events and opportunities.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2">
                        <AccordionTrigger>
                            How do I create an account?
                        </AccordionTrigger>
                        <AccordionContent>
                            You can create an account by clicking the "Sign Up"
                            button in the top right corner of the website.
                            You'll need to use your Cornell Tech email address
                            to register.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-3">
                        <AccordionTrigger>
                            Is this platform officially affiliated with Cornell
                            Tech?
                        </AccordionTrigger>
                        <AccordionContent>
                            No, this is a student-built independent project and{" "}
                            <strong>
                                is not officially affiliated with Cornell Tech
                            </strong>
                            . <br />
                            It is created by students for students to enhance
                            the Cornell Tech experience.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-4">
                        <AccordionTrigger>
                            How can I contribute to the platform?
                        </AccordionTrigger>
                        <AccordionContent>
                            You can contribute by participating in the forum
                            discussions, sharing resources, and providing
                            feedback through the feedback form. If you're
                            interested in contributing to the development of the
                            platform, please contact the development team.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-5">
                        <AccordionTrigger>
                            How do I report inappropriate content?
                        </AccordionTrigger>
                        <AccordionContent>
                            If you encounter any inappropriate content, please
                            use the feedback forum to report it. <br />
                            (Report feature coming soon)
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Still have questions?</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            If you can't find the answer you're looking for,
                            feel free to reach out through our feedback form or
                            contact the development team directly.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

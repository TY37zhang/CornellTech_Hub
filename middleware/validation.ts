import { NextResponse } from "next/server";
import { z } from "zod";
import { schemas } from "@/lib/validations/schemas";

type ValidationSchema = keyof typeof schemas;

export async function validateRequest(
    request: Request,
    schema: ValidationSchema,
    subSchema?: string
) {
    try {
        // Clone the request before reading the body
        const clonedRequest = request.clone();
        const body = await clonedRequest.json();
        let validationSchema: z.ZodType;

        if (subSchema) {
            validationSchema = schemas[schema][
                subSchema as keyof (typeof schemas)[ValidationSchema]
            ] as z.ZodType;
        } else {
            validationSchema = schemas[schema] as z.ZodType;
        }

        if (!validationSchema) {
            throw new Error("Invalid validation schema");
        }

        const validatedData = validationSchema.parse(body);
        return { success: true, data: validatedData };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: {
                    message: "Validation error",
                    details: error.errors,
                },
            };
        }
        return {
            success: false,
            error: {
                message: "Invalid request",
                details: error,
            },
        };
    }
}

export function validationMiddleware(
    schema: ValidationSchema,
    subSchema?: string
) {
    return async (request: Request) => {
        const validationResult = await validateRequest(
            request.clone(), // Clone the request before validation
            schema,
            subSchema
        );

        if (!validationResult.success) {
            return NextResponse.json(
                { error: validationResult.error },
                { status: 400 }
            );
        }

        // Create a new request with the validated data
        const headers = new Headers(request.headers);
        const requestWithData = new Request(request.url, {
            method: request.method,
            headers: headers,
            body: request.body,
            cache: request.cache,
            credentials: request.credentials,
            integrity: request.integrity,
            keepalive: request.keepalive,
            mode: request.mode,
            redirect: request.redirect,
            referrer: request.referrer,
            referrerPolicy: request.referrerPolicy,
            signal: request.signal,
        });

        // Add validated data to the request
        Object.defineProperty(requestWithData, "validatedData", {
            value: validationResult.data,
            writable: false,
        });

        return requestWithData;
    };
}

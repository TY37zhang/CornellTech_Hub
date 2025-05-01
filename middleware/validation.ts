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
        const body = await request.json();
        let validationSchema;

        if (subSchema) {
            validationSchema =
                schemas[schema][
                    subSchema as keyof (typeof schemas)[ValidationSchema]
                ];
        } else {
            validationSchema = schemas[schema];
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
            request,
            schema,
            subSchema
        );

        if (!validationResult.success) {
            return NextResponse.json(
                { error: validationResult.error },
                { status: 400 }
            );
        }

        // Add validated data to request for use in route handlers
        const requestWithData = new Request(request);
        Object.defineProperty(requestWithData, "validatedData", {
            value: validationResult.data,
            writable: false,
        });

        return requestWithData;
    };
}

import { NextResponse } from "next/server";
import { getSystemHealth } from "@/services/health.service";

/**
 * GET /api/health
 * Public health-check endpoint for uptime monitoring and connectivity verification.
 */
export async function GET() {
  try {
    const health = await getSystemHealth();
    return NextResponse.json(
      {
        success: true,
        data: health,
      },
      {
        status: health.status === "healthy" ? 200 : 200, // Return 200 with status info so monitoring does not fail build
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "HEALTH_CHECK_FAILED",
          message: "System health check failed to complete.",
        },
      },
      { status: 500 }
    );
  }
}

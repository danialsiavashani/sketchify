import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { detail: "Authentication required." },
      { status: 401 }
    );
  }

  const formData = await req.formData();

  const res = await fetch(`${BACKEND_URL}/api/v1/generate/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
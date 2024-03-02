import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostValidator } from "@/lib/validators/post";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const { subredditId, title, content } = PostValidator.parse(body);

    const subscriptionExists = await db.subscription.findFirst({
      where: {
        subredditId,
        userId: session.user.id,
      },
    });

    if (!subscriptionExists) {
      return new Response("Subscribe to post.", {
        status: 400,
      });
    }
    console.log(session.user ,subredditId)
    await db.subscription.create({
      data: {
        subredditId,
        userId: session.user.id,
      },
    });

    await db.post.create({
      data:{
        title,
        content,
        authorId: session.user.id,
        subredditId,
      }
    })

    return new Response('OK');
  } catch (error) {
    (error)
    if (error instanceof z.ZodError) {
      return new Response('Invalid post resquest data passed', { status: 422 });
    }
    console.log(error)
    return new Response(
      "Could not subreddit to subreddit at this time.Please try later",
      { status: 500 }
    );
  }
}
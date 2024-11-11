import { GameCode } from "@/database";
import checkAuthAndRedirect from "@/utils/checkAuthAndRedirect";
import { NextRequest, NextResponse } from "next/server";

interface GameRouteParams {
  code: string;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: GameRouteParams },
) {
  const session = await checkAuthAndRedirect();
  const code = params.code;

  // get query param userId from request
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json("User ID is required", { status: 400 });
  }

  const gameCode = await GameCode.findOne({
    where: {
      code: code.toLowerCase().trim(),
    },
    include: ["users"],
  });

  if (!gameCode) {
    return NextResponse.json("Game code not found", { status: 404 });
  }

  const userInGame = gameCode.users.find((user) => user.id === userId);

  if (!userInGame) {
    return NextResponse.json("User not in game", { status: 404 });
  }
  // @ts-expect-error
  await gameCode.removeUser(userInGame);

  return NextResponse.json(
    { message: "User removed from game" },
    { status: 200 },
  );
}

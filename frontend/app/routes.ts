import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  route("game", "routes/game.tsx", [
    route("chat", "routes/game/chat.tsx"),
    route("profile", "routes/game/profile.tsx"),
    route("restaurant", "routes/game/restaurant.tsx"),
    route("cards", "routes/game/cards.tsx"),
    route("shop", "routes/game/shop.tsx"),
    route("ranking", "routes/game/ranking.tsx")
  ])
] satisfies RouteConfig;

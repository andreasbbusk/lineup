# TSOA & Express: How Endpoint Coding Works Now

This guide explains the new workflow for creating API endpoints using **TSOA** in our project. We are still using Express under the hood, but TSOA abstracts the boilerplate to give us type safety and automatic Swagger documentation.

---

## 1. The New Workflow (Class-Based Controllers)

Instead of writing functions that take `(req, res)`, you now write **Classes** with methods that return **Data**.

### Old Way (Manual Express)

```typescript
export const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  // ... logic ...
  res.json({ id, name: "John" }); // You manually send JSON
};

// src/routes/users.routes.ts
router.get("/:id", getUser); // You manually wire up routes
```

### New Way (TSOA)

```typescript
import { Controller, Get, Route, Path } from "tsoa";

@Route("users") // Base path: /users
export class UsersController extends Controller {
  @Get("{id}") // Endpoint: GET /users/:id
  public async getUser(@Path() id: string): Promise<User> {
    // ... logic ...
    return { id, name: "John" }; // You just return data!
  }
}
```

**TSOA handles the rest:** It generates the route file, handles the `res.json()`, and creates the Swagger docs.

---

## 2. How to Access Request & Response

Even though TSOA hides `req` and `res`, you can still access them when needed.

### Accessing the Request Object (Headers, etc.)

Use the `@Request()` decorator.

```typescript
import { Request as ExpressRequest } from "express";
import { Request } from "tsoa";

@Get("/")
public async getProfile(@Request() request: ExpressRequest): Promise<Profile> {
  const token = request.headers.authorization; // Access headers directly
  // ...
}
```

### Setting Status Codes & Headers

Your controller extends the `Controller` class, which gives you helper methods.

```typescript
@Post("/")
public async createUser(@Body() body: CreateUserDto): Promise<void> {
  // Logic to create user...

  this.setStatus(201); // Set HTTP 201 Created
  this.setHeader("Location", "/users/123"); // Set custom header
}
```

---

## 3. How TSOA Generates Express Code ("Under the Hood")

When you run `npm run tsoa` (or `npm run dev`), TSOA reads your controllers and generates a file at `src/routes/tsoa-routes.ts`.

This generated file contains the actual Express code that looks something like this (simplified):

```typescript
// src/routes/tsoa-routes.ts (Generated - DO NOT EDIT)

app.get("/users/:id", async (request, response, next) => {
  const controller = new UsersController();

  // TSOA validates and extracts the 'id' param from the URL
  const id = request.params.id;

  try {
    // TSOA calls your method
    const data = await controller.getUser(id);

    // TSOA sends the response for you
    response.status(controller.getStatus() || 200);
    response.json(data);
  } catch (err) {
    next(err);
  }
});
```

---

## 4. Key Decorators Cheat Sheet

| Decorator        | Purpose                  | Example                         |
| :--------------- | :----------------------- | :------------------------------ |
| `@Route("path")` | Base path for controller | `@Route("users")`               |
| `@Get("/")`      | GET endpoint             | `@Get("{id}")`                  |
| `@Post("/")`     | POST endpoint            | `@Post("/")`                    |
| `@Path()`        | URL Path Parameter       | `getUser(@Path() id: string)`   |
| `@Query()`       | URL Query Parameter      | `search(@Query() q: string)`    |
| `@Body()`        | JSON Body Payload        | `create(@Body() user: UserDto)` |
| `@Request()`     | Express Request Object   | `func(@Request() req: Request)` |
| `@Tags("Name")`  | Group in Swagger UI      | `@Tags("Users")`                |

---

## 5. Summary

1.  **Write a Class** extending `Controller`.
2.  **Add Decorators** (`@Route`, `@Get`, etc.) to define endpoints.
3.  **Return Data** directly (Promises are fine).
4.  **TSOA Generates** the Express routes and Swagger docs automatically.

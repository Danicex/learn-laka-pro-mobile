# TypeScript Reference Guide

A structured reference to core TypeScript concepts. Each topic follows the same format: what it is, why it exists (vs. plain JS), a code example, real-world usage, and guard rules (best practices / pitfalls to avoid).

---

## 1. Types

**Why it's needed, why not normal JS**
JavaScript is dynamically typed — a variable can silently hold any value, and mismatches only surface at runtime (often in production). TypeScript's static type system catches type errors at compile time, before code ever runs. This eliminates a huge class of bugs like calling `.toUpperCase()` on a number or passing a string where an object was expected.

**Code example**
```ts
let age: number = 30;
let name: string = "Ada";
let isActive: boolean = true;
let tags: string[] = ["admin", "user"];
let coords: [number, number] = [10, 20]; // tuple

age = "thirty"; // ❌ Compile-time error: Type 'string' is not assignable to type 'number'
```

**Real world usage**
Typing function parameters and API response shapes so a typo like `user.emial` is caught immediately in the editor instead of causing a silent `undefined` bug in production.

**Guard rules**
- Avoid `any` — it disables type checking entirely and defeats the purpose of TypeScript.
- Prefer explicit types on function boundaries (params/returns); let TypeScript infer for local variables.
- Enable `strict: true` in `tsconfig.json` from day one — retrofitting strictness later is painful.

---

## 2. Interfaces

**Why it's needed, why not normal JS**
Plain JS objects have no enforced shape — any property can be added, removed, or misspelled without warning. Interfaces let you define a contract for what an object must look like, so tools and teammates immediately know the expected structure.

**Code example**
```ts
interface User {
  id: number;
  name: string;
  email?: string;      // optional property
  readonly createdAt: Date; // cannot be reassigned after creation
}

function printUser(user: User): void {
  console.log(`${user.id}: ${user.name}`);
}

printUser({ id: 1, name: "Ada", createdAt: new Date() }); // ✅ email is optional
```

**Real world usage**
Defining the shape of API payloads (`interface ApiResponse<T>`), component props in React, or database models — so every consumer of that data agrees on its structure.

**Guard rules**
- Use interfaces for object shapes that might be extended or implemented by classes.
- Use `readonly` for properties that shouldn't change after creation (e.g. IDs, timestamps).
- Prefer `interface` over `type` for public API contracts, since interfaces support declaration merging and are generally more extensible.

---

## 3. Type Aliases

**Why it's needed, why not normal JS**
JS has no way to name a reusable "shape" for primitives, unions, tuples, or function signatures. Type aliases let you give a name to any type — not just objects — reducing duplication and making complex types readable.

**Code example**
```ts
type ID = string | number;
type Point = { x: number; y: number };
type Callback = (error: Error | null, data?: string) => void;

function findUser(id: ID): Point {
  return { x: 0, y: 0 };
}
```

**Real world usage**
Naming a union of allowed string literals for a status field (`type OrderStatus = "pending" | "shipped" | "delivered"`) so it can be reused across functions, components, and API validators.

**Guard rules**
- Use `type` for unions, primitives, tuples, and function types — interfaces can't express these directly.
- Don't mix conventions arbitrarily on a team; agree on `interface` for objects and `type` for everything else.
- Avoid overly deep/nested type aliases that hurt readability — break them into smaller named pieces.

---

## 4. Generics

**Why it's needed, why not normal JS**
Without generics, you either write duplicate functions for every type (`getFirstString`, `getFirstNumber`...) or fall back to `any`, losing type safety. Generics let you write reusable code that stays type-safe across different types.

**Code example**
```ts
function getFirst<T>(arr: T[]): T | undefined {
  return arr[0];
}

const firstNum = getFirst<number>([1, 2, 3]);   // number
const firstStr = getFirst(["a", "b"]);           // string (inferred)

interface ApiResponse<T> {
  data: T;
  status: number;
}

const res: ApiResponse<User> = { data: { id: 1, name: "Ada", createdAt: new Date() }, status: 200 };
```

**Real world usage**
A generic `fetchData<T>(url: string): Promise<T>` helper used across an app for every API call, so each call site gets the correct return type without rewriting the function.

**Guard rules**
- Don't overuse generics where a simple union or `unknown` would do — it adds unnecessary cognitive load.
- Constrain generics with `extends` when the type needs specific properties (e.g. `<T extends { id: number }>`).
- Name generics meaningfully in complex cases (`TItem`, `TResponse`) instead of always `T`, `U`, `V`.

---

## 5. Functions

**Why it's needed, why not normal JS**
In plain JS, calling a function with the wrong number or type of arguments fails silently or throws at runtime. TypeScript checks parameter types, return types, and optional/default parameters at compile time.

**Code example**
```ts
function add(a: number, b: number): number {
  return a + b;
}

function greet(name: string, greeting: string = "Hello"): string {
  return `${greeting}, ${name}!`;
}

function logMessage(message: string, ...extra: string[]): void {
  console.log(message, extra);
}

const multiply = (a: number, b: number): number => a * b;
```

**Real world usage**
Enforcing that an event handler always receives a correctly-typed event object, or that a pricing function always returns a `number`, never `undefined`, preventing downstream NaN bugs.

**Guard rules**
- Always type return values on exported/public functions — inferred return types can silently change and break callers.
- Use optional (`?`) or default parameters instead of checking `arguments.length` manually.
- Avoid functions with more than 3–4 parameters; use an options object with an interface instead.

---

## 6. Classes

**Why it's needed, why not normal JS**
JS classes exist, but have no access modifiers, no interface implementation checks, and no compile-time enforcement of constructor contracts. TypeScript adds `public`/`private`/`protected`, abstract classes, and interface implementation checking on top of JS classes.

**Code example**
```ts
abstract class Shape {
  protected abstract area(): number;

  describe(): string {
    return `Area: ${this.area()}`;
  }
}

class Circle extends Shape {
  constructor(private radius: number) {
    super();
  }

  protected area(): number {
    return Math.PI * this.radius ** 2;
  }
}

const c = new Circle(5);
console.log(c.describe()); // ✅
console.log(c.radius);     // ❌ 'radius' is private
```

**Real world usage**
Modeling domain entities (e.g. `class Order`, `class PaymentProcessor`) where internal state must stay encapsulated and only exposed through controlled public methods.

**Guard rules**
- Default to `private` for internal state; only expose what consumers actually need.
- Use `abstract` classes to force subclasses to implement required methods, catching missing implementations at compile time.
- Prefer composition over deep inheritance chains — they become hard to type and maintain.

---

## 7. Enums

**Why it's needed, why not normal JS**
JS typically represents fixed sets of options with raw strings or numbers scattered across the codebase, inviting typos (`"Pending"` vs `"pending"`). Enums centralize a named set of constant values with type safety.

**Code example**
```ts
enum OrderStatus {
  Pending = "PENDING",
  Shipped = "SHIPPED",
  Delivered = "DELIVERED",
}

function updateStatus(status: OrderStatus): void {
  console.log(`New status: ${status}`);
}

updateStatus(OrderStatus.Shipped); // ✅
updateStatus("shipped");           // ❌ Compile-time error
```

**Real world usage**
Representing a fixed set of application states (order status, user roles, HTTP methods) so every place in the code refers to the same canonical values instead of loose strings.

**Guard rules**
- Prefer string enums (`Enum = "VALUE"`) over numeric enums — they're more debuggable in logs and network payloads.
- Consider a union of string literals (`type Status = "pending" | "shipped"`) instead of `enum` for simpler cases — it's more tree-shakeable and doesn't generate runtime code.
- Don't reorder numeric enum members once shipped — it silently changes existing numeric values.

---

## 8. Union & Intersection Types

**Why it's needed, why not normal JS**
JS variables can hold "one of several" or "combined" shapes with no way to declare or check that at compile time. Union types (`A | B`) express "one of these," and intersection types (`A & B`) express "all of these combined."

**Code example**
```ts
type Success = { status: "success"; data: string };
type Failure = { status: "error"; message: string };
type Result = Success | Failure; // union

type Timestamped = { createdAt: Date };
type Named = { name: string };
type NamedRecord = Timestamped & Named; // intersection

function handle(result: Result) {
  if (result.status === "success") {
    console.log(result.data); // TS knows this is Success here
  } else {
    console.log(result.message); // TS knows this is Failure here
  }
}
```

**Real world usage**
Modeling API responses that can be either a success or error shape (`union`), or combining a base entity type with a mixin like `Timestamped` (`intersection`) across multiple models.

**Guard rules**
- Give union members a common discriminant field (like `status`) to enable type narrowing — avoid "bag of optional fields" unions.
- Keep intersections shallow; deeply intersected types become unreadable and hard to debug.
- Watch for intersections of incompatible primitive types (`string & number`) which resolve to `never`.

---

## 9. Type Narrowing

**Why it's needed, why not normal JS**
When a variable could be multiple types (a union), JS gives no compile-time way to know which type you're dealing with at a given point — you just hope your runtime check is correct. TypeScript narrows the type automatically based on runtime checks like `typeof`, `instanceof`, or custom guards.

**Code example**
```ts
function formatValue(value: string | number | Date) {
  if (typeof value === "string") {
    return value.toUpperCase();       // narrowed to string
  } else if (typeof value === "number") {
    return value.toFixed(2);          // narrowed to number
  } else {
    return value.toISOString();       // narrowed to Date
  }
}

function isError(x: unknown): x is Error {
  return x instanceof Error;
}
```

**Real world usage**
Safely handling `catch (err: unknown)` blocks, or branching logic on an API response union (`Success | Failure`) without unsafe type casting.

**Guard rules**
- Never use `as` casts to force a type when a proper narrowing check (`typeof`, `in`, custom type guard) is possible — casts bypass safety instead of proving it.
- Use discriminated unions with a `switch` on the discriminant for exhaustive, narrowed handling of every case.
- Add a `default: assertNever(value)` case in switches to get a compile error if a new union member is added but not handled.

---

## 10. Utility Types

**Why it's needed, why not normal JS**
JS has no built-in way to derive a new type from an existing one (e.g. "same as User, but all fields optional"). TypeScript ships utility types that transform existing types instead of forcing you to hand-write duplicate, drift-prone definitions.

**Code example**
```ts
interface User {
  id: number;
  name: string;
  email: string;
}

type PartialUser = Partial<User>;         // all fields optional
type UserPreview = Pick<User, "id" | "name">; // only id & name
type UserWithoutEmail = Omit<User, "email">;  // everything except email
type ReadonlyUser = Readonly<User>;       // all fields readonly
type UserRecord = Record<string, User>;   // { [key: string]: User }
```

**Real world usage**
Using `Partial<User>` for a PATCH/update endpoint that only requires some fields, or `Pick<User, "id" | "name">` for a lightweight list view, without duplicating the `User` interface.

**Guard rules**
- Prefer deriving types with utility types over manually copy-pasting a modified interface — copies drift out of sync as the source type evolves.
- Learn the core set first: `Partial`, `Required`, `Pick`, `Omit`, `Record`, `Readonly`, `ReturnType`.
- Don't chain excessive utility types on one line — extract intermediate named types for readability.

---

## 11. Modules

**Why it's needed, why not normal JS**
Older JS relied on global scripts or non-standard module systems (CommonJS-only, IIFEs) with inconsistent tooling support. TypeScript builds on ES modules (`import`/`export`) with static type checking across file boundaries, so imported values carry their types with them.

**Code example**
```ts
// user.ts
export interface User {
  id: number;
  name: string;
}

export function createUser(name: string): User {
  return { id: Date.now(), name };
}

// main.ts
import { User, createUser } from "./user";

const u: User = createUser("Ada");
```

**Real world usage**
Splitting a large app into feature folders (`user/`, `orders/`, `auth/`) each exporting typed interfaces and functions, so other modules import both the logic and its types safely.

**Guard rules**
- Use named exports for most things; reserve `export default` for a single obvious "main" export per file.
- Avoid circular imports between modules — they cause subtle runtime and type-resolution bugs.
- Configure `"module"` and `"moduleResolution"` in `tsconfig.json` to match your build tool (bundler, Node ESM, etc.) to avoid import resolution errors.

---

## 12. Async / Await

**Why it's needed, why not normal JS**
JS already has `async`/`await`, but plain JS gives no guarantee about what a `Promise` resolves to — you find out at runtime, often after a crash. TypeScript types the resolved value of a `Promise<T>`, so `await` gives you a correctly-typed result and catches misuse at compile time.

**Code example**
```ts
interface User {
  id: number;
  name: string;
}

async function fetchUser(id: number): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch user");
  }
  return res.json() as Promise<User>;
}

async function main() {
  const user = await fetchUser(1); // user is typed as User
  console.log(user.name);          // ✅ safe, autocompletes
}
```

**Real world usage**
Typing API client functions so every caller knows exactly what shape of data comes back from an `await`, instead of treating the resolved value as `any`.

**Guard rules**
- Always type the `Promise<T>` return value explicitly on exported async functions.
- Wrap `await` calls in `try/catch` (or handle rejection explicitly) — TypeScript won't catch unhandled promise rejections for you.
- Be careful with `res.json() as Promise<User>` — casting doesn't validate the actual runtime shape; pair with runtime validation (e.g. Zod) for untrusted data.

---

## 13. Decorators

**Why it's needed, why not normal JS**
JS has no standard, mature way to attach reusable metadata or cross-cutting behavior (logging, validation, dependency injection) to classes and methods without manually wrapping every one. TypeScript decorators provide a declarative `@decorator` syntax to annotate and modify classes, methods, and properties.

**Code example**
```ts
function Log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyKey} with`, args);
    return original.apply(this, args);
  };
}

class Calculator {
  @Log
  add(a: number, b: number): number {
    return a + b;
  }
}

new Calculator().add(2, 3); // logs "Calling add with [2, 3]"
```

**Real world usage**
Frameworks like Angular (`@Component`, `@Injectable`) and NestJS (`@Controller`, `@Get`, `@Injectable`) use decorators heavily to wire up dependency injection, routing, and metadata without boilerplate.

**Guard rules**
- Decorators require `"experimentalDecorators": true` in `tsconfig.json` (legacy) or target the newer TC39 stage-3 decorators depending on your TS/build version — check compatibility before adopting.
- Don't overuse decorators for simple logic that a plain function would handle more transparently — they can obscure control flow.
- Keep decorator implementations side-effect-light and well-tested, since they run implicitly on every decorated member.

---

## 14. React with TypeScript

**Why it's needed, why not normal JS**
In plain JS/React, component props have no enforced shape — passing the wrong prop type or a missing required prop only fails at runtime (or silently renders `undefined`). TypeScript types props, state, hooks, and event handlers, catching UI bugs before the component ever renders.

**Code example**
```tsx
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

function Button({ label, onClick, variant = "primary" }: ButtonProps) {
  return (
    <button className={variant} onClick={onClick}>
      {label}
    </button>
  );
}

// Typed state and event handler
function Counter() {
  const [count, setCount] = useState<number>(0);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setCount((prev) => prev + 1);
  };

  return <Button label={`Count: ${count}`} onClick={handleClick as any} />;
}
```

**Real world usage**
Defining `Props` interfaces for every shared component in a design system, so misuse (missing `onClick`, wrong `variant` string) is caught in the editor instead of during QA or in production.

**Guard rules**
- Always type component props explicitly with an `interface Props` or `type Props` — don't rely on inferred `any` from destructured parameters.
- Type `useState<T>` explicitly when the initial value doesn't fully convey the intended type (e.g. `useState<User | null>(null)`).
- Avoid `React.FC` for most cases (it implicitly adds `children` and has awkward generic support); type props directly on the function instead.
- Use specific event types (`React.MouseEvent<HTMLButtonElement>`, `React.ChangeEvent<HTMLInputElement>`) instead of `any` for event handlers.

---

# Clerk Authentication Flow

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Browser       │    │   Next.js API    │    │   Clerk Backend │
│                 │    │   Route          │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
    1.   │ GET /api/me/...       │                       │
         │ Cookie: __session=jwt │                       │
         ├──────────────────────►│                       │
         │                       │                       │
    2.   │                       │ auth() function       │
         │                       │ - Extract JWT token   │
         │                       │ - Verify signature    │
         │                       │ - Check expiration    │
         │                       │                       │
    3.   │                       │ Optional: Verify      │
         │                       │ session still valid   │
         │                       ├──────────────────────►│
         │                       │                       │
    4.   │                       │ ◄──────────────────────┤
         │                       │ Session valid ✓       │
         │                       │                       │
    5.   │                       │ Return { userId }     │
         │                       │ Process request       │
         │                       │                       │
    6.   │ ◄──────────────────────┤                       │
         │ Response with user     │                       │
         │ specific data          │                       │
```
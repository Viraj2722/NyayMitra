# NyayMitra: Database Schema (Firebase Data Connect)

We are using **Firebase Data Connect** (backed by Google Cloud SQL PostgreSQL) instead of basic Firestore. This gives us strong relationships, GraphQl type-safety, and incredible scalability. 

The primary schema definition is stored in `dataconnect/schema/schema.gql`.

## Setup & Deployment Instructions

1. Make sure you have initialized the project with `firebase init dataconnect`.
2. Whenever you update `schema.gql`, deploy your changes or test locally using:
   ```bash
   firebase deploy --only dataconnect
   ```

Below is our active GraphQL-based schema:

## The Schema

```graphql
type User @table {
  uid: String! @unique
  name: String
  preferredLanguage: String
  createdAt: Timestamp
}

type LegalAidCenter @table {
  name: String!
  address: String!
  phone: String!
  latitude: Float!
  longitude: Float!
  freeServices: Boolean!
  categories: [String]!
  timings: String
  description: String
  createdAt: Timestamp!
}

type UserQuery @table {
  user: User                        # Optional
  queryText: String                 # Nullable for Anonymous Mode
  detectedLanguage: String!
  legalCategoryDetected: String
  isUrgent: Boolean!
  isAnonymous: Boolean!
  aiResponse: String
  createdAt: Timestamp!
}

type Appointment @table {
  user: User                        # Optional
  legalAidCenter: LegalAidCenter!
  userName: String!
  userContact: String!
  problemSummary: String!
  preferredDate: Date!
  preferredTime: String
  status: String!                   # "pending", "confirmed", "completed"
  createdAt: Timestamp!
}
```

---

### Key Highlights for the Hackathon Judges

*   **Relational Precision:** Unlike standard NoSQL hackathon databases, we went with Google Cloud SQL structure using Data Connect for type safety.
*   **Built-in Privacy:** `UserQuery` specifically decouples PII by making `user` and `queryText` completely optional, proving our "Anonymous Mode" guarantees data security at the database row level.
*   **Future-Proof Structure:** The `Appointment` connection automatically joins `LegalAidCenter` and `User` natively.

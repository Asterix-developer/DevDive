import { collection, doc, getDocs, getDoc, setDoc, updateDoc, query, orderBy } from "firebase/firestore"
import { db, isFirebaseAvailable } from "./firebase"
import type { Planet, PlayerStats, Mission } from "@/types/game"

// Mock data fallback
const mockPlanets: Planet[] = [
  {
    id: "observable-base",
    name: "Observable Base",
    description: "Learn the fundamentals of RxJS Observables",
    distance: "2.48.4rom",
    type: "tutorial",
    unlocked: true,
    position: { x: 400, y: 300 },
    color: "#4ECDC4",
    requiredFuel: 0,
    reward: { fuel: 100, artifacts: 0.25, rank: 50 },
  },
  {
    id: "map-station",
    name: "Map Station",
    description: "Transform data with the map operator",
    distance: "4.36.9kam",
    type: "challenge",
    unlocked: false,
    position: { x: 800, y: 200 },
    color: "#FF6B6B",
    requiredFuel: 50,
    reward: { fuel: 150, artifacts: 0.5, rank: 75 },
  },
  {
    id: "filter-anomaly",
    name: "Filter Anomaly",
    description: "Filter valuable meteors from a storm",
    distance: "1.75.61com",
    type: "mission",
    unlocked: true,
    position: { x: 200, y: 500 },
    color: "#9B59B6",
    requiredFuel: 25,
    reward: { fuel: 125, artifacts: 0.35, rank: 60 },
  },
  {
    id: "merge-nebula",
    name: "Merge Nebula",
    description: "Combine multiple data streams",
    distance: "3.8.97.2weim",
    type: "challenge",
    unlocked: false,
    position: { x: 1200, y: 400 },
    color: "#3498DB",
    requiredFuel: 75,
    reward: { fuel: 200, artifacts: 0.75, rank: 100 },
  },
  {
    id: "switchmap-vortex",
    name: "SwitchMap Vortex",
    description: "Navigate through dimensional switches",
    distance: "52.5.56ram",
    type: "advanced",
    unlocked: false,
    position: { x: 600, y: 700 },
    color: "#E74C3C",
    requiredFuel: 100,
    reward: { fuel: 250, artifacts: 1.0, rank: 150 },
  },
  {
    id: "debounce-field",
    name: "Debounce Field",
    description: "Control the flow of rapid events",
    distance: "7.2.34.8lux",
    type: "advanced",
    unlocked: false,
    position: { x: 1400, y: 300 },
    color: "#F39C12",
    requiredFuel: 120,
    reward: { fuel: 300, artifacts: 1.25, rank: 175 },
  },
  {
    id: "combinelatest-hub",
    name: "CombineLatest Hub",
    description: "Synchronize multiple data sources",
    distance: "9.1.45.2zen",
    type: "expert",
    unlocked: false,
    position: { x: 100, y: 800 },
    color: "#8E44AD",
    requiredFuel: 150,
    reward: { fuel: 400, artifacts: 1.5, rank: 200 },
  },
  {
    id: "take-station",
    name: "Take Station",
    description: "Limit the number of emissions",
    distance: "3.2.18.5neo",
    type: "tutorial",
    unlocked: false,
    position: { x: 900, y: 600 },
    color: "#2ECC71",
    requiredFuel: 30,
    reward: { fuel: 120, artifacts: 0.3, rank: 55 },
  },
  {
    id: "scan-observatory",
    name: "Scan Observatory",
    description: "Accumulate values over time",
    distance: "5.7.22.1arc",
    type: "challenge",
    unlocked: false,
    position: { x: 1600, y: 500 },
    color: "#1ABC9C",
    requiredFuel: 90,
    reward: { fuel: 180, artifacts: 0.6, rank: 85 },
  },
  {
    id: "distinct-realm",
    name: "Distinct Realm",
    description: "Filter out duplicate emissions",
    distance: "4.1.33.7qux",
    type: "mission",
    unlocked: false,
    position: { x: 300, y: 100 },
    color: "#E67E22",
    requiredFuel: 60,
    reward: { fuel: 160, artifacts: 0.45, rank: 70 },
  },
  {
    id: "retry-fortress",
    name: "Retry Fortress",
    description: "Handle errors with retry logic",
    distance: "8.9.44.2def",
    type: "advanced",
    unlocked: false,
    position: { x: 1100, y: 100 },
    color: "#C0392B",
    requiredFuel: 140,
    reward: { fuel: 320, artifacts: 1.1, rank: 160 },
  },
  {
    id: "share-nexus",
    name: "Share Nexus",
    description: "Share observables between subscribers",
    distance: "6.3.55.8ghi",
    type: "expert",
    unlocked: false,
    position: { x: 50, y: 200 },
    color: "#9C27B0",
    requiredFuel: 180,
    reward: { fuel: 450, artifacts: 1.8, rank: 220 },
  },
]

const mockMissions: Record<string, Mission> = {
  "observable-base": {
    id: "observable-base",
    title: "Observable Base Station",
    description: "Welcome to your first RxJS mission! Create an Observable that emits a sequence of numbers.",
    difficulty: "easy",
    initialCode: `// Create an Observable that emits 1, 2, 3
import { Observable } from 'rxjs';

const numbers$ = new Observable(subscriber => {
  // Your code here
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  subscriber.complete();
});

numbers$.subscribe(value => console.log(value));`,
    tests: [
      {
        name: "Should emit numbers 1, 2, 3",
        expectedOutput: [1, 2, 3],
        testCode: `
// Test: Check if Observable emits 1, 2, 3
const results = [];
const numbers$ = new Observable(subscriber => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  subscriber.complete();
});
numbers$.subscribe(value => results.push(value));
return results;
        `,
      },
    ],
    inputMarbles: [1, 2, 3],
    outputMarbles: [1, 2, 3],
    reward: { fuel: 100, artifacts: 0.25, rank: 50 },
  },
  "filter-anomaly": {
    id: "filter-anomaly",
    title: "Filter Anomaly",
    description: "Filter valuable meteors (even numbers) from a storm.",
    difficulty: "medium",
    initialCode: `// Filter even numbers from the stream
import { of } from 'rxjs';
import { filter } from 'rxjs/operators';

const numbers$ = of(1, 2, 3, 4, 5);
const filtered$ = numbers$.pipe(
  filter(n => n % 2 === 0)
);

filtered$.subscribe(value => console.log(value));`,
    tests: [
      {
        name: "Should filter even numbers",
        expectedOutput: [2, 4],
        testCode: `
// Test: Check if filter correctly filters even numbers
const results = [];
const numbers$ = of(1, 2, 3, 4, 5);
const filtered$ = numbers$.pipe(filter(n => n % 2 === 0));
filtered$.subscribe(value => results.push(value));
return results;
        `,
      },
    ],
    inputMarbles: [1, 2, 3, 4, 5],
    outputMarbles: [2, 4],
    reward: { fuel: 125, artifacts: 0.35, rank: 60 },
  },
  "map-station": {
    id: "map-station",
    title: "Map Station",
    description: "Transform numbers by doubling them using the map operator.",
    difficulty: "medium",
    initialCode: `// Transform numbers by doubling them
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

const numbers$ = of(1, 2, 3, 4);
const doubled$ = numbers$.pipe(
  // Your code here
  map(n => n * 2)
);

doubled$.subscribe(value => console.log(value));`,
    tests: [
      {
        name: "Should double all numbers",
        expectedOutput: [2, 4, 6, 8],
        testCode: `
// Test: Check if map correctly doubles all numbers
const results = [];
const numbers$ = of(1, 2, 3, 4);
const doubled$ = numbers$.pipe(map(n => n * 2));
doubled$.subscribe(value => results.push(value));
return results;
        `,
      },
    ],
    inputMarbles: [1, 2, 3, 4],
    outputMarbles: [2, 4, 6, 8],
    reward: { fuel: 150, artifacts: 0.5, rank: 75 },
  },
  "take-station": {
    id: "take-station",
    title: "Take Station",
    description: "Use the take operator to limit emissions to the first 3 values.",
    difficulty: "easy",
    initialCode: `// Take only the first 3 values
import { of } from 'rxjs';
import { take } from 'rxjs/operators';

const numbers$ = of(1, 2, 3, 4, 5, 6);
const limited$ = numbers$.pipe(
  // Your code here
  take(3)
);

limited$.subscribe(value => console.log(value));`,
    tests: [
      {
        name: "Should take only first 3 values",
        expectedOutput: [1, 2, 3],
        testCode: `
// Test: Check if take correctly limits to 3 values
const results = [];
const numbers$ = of(1, 2, 3, 4, 5, 6);
const limited$ = numbers$.pipe(take(3));
limited$.subscribe(value => results.push(value));
return results;
        `,
      },
    ],
    inputMarbles: [1, 2, 3, 4, 5, 6],
    outputMarbles: [1, 2, 3],
    reward: { fuel: 120, artifacts: 0.3, rank: 55 },
  },
}

class FirebaseService {
  private useFirebase = false

  constructor() {
    this.useFirebase = isFirebaseAvailable()
    if (this.useFirebase) {
      console.log("FirebaseService: Using Firebase backend")
    } else {
      console.log("FirebaseService: Using mock data")
    }
  }

  async getPlanets(): Promise<Planet[]> {
    if (!this.useFirebase || !db) {
      return Promise.resolve(mockPlanets)
    }

    try {
      const planetsRef = collection(db, "planets")
      const snapshot = await getDocs(query(planetsRef, orderBy("position.x")))
      const planets = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Planet)
      return planets.length > 0 ? planets : mockPlanets
    } catch (error) {
      console.warn("Firebase getPlanets failed, using mock data:", error)
      return mockPlanets
    }
  }

  async getMission(planetId: string): Promise<Mission | null> {
    if (!this.useFirebase || !db) {
      return Promise.resolve(mockMissions[planetId] || null)
    }

    try {
      const missionRef = doc(db, "missions", planetId)
      const snapshot = await getDoc(missionRef)
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Mission
      } else {
        return mockMissions[planetId] || null
      }
    } catch (error) {
      console.warn("Firebase getMission failed, using mock data:", error)
      return mockMissions[planetId] || null
    }
  }

  async getPlayerStats(userId: string): Promise<PlayerStats> {
    const defaultStats: PlayerStats = {
      fuel: 4400,
      fuelLevel: 3.3,
      artifacts: 2.25,
      captainRank: 2530,
      completedMissions: [],
    }

    if (!this.useFirebase || !db) {
      return Promise.resolve(defaultStats)
    }

    try {
      const playerRef = doc(db, "players", userId)
      const snapshot = await getDoc(playerRef)
      return snapshot.exists() ? ({ ...snapshot.data() } as PlayerStats) : defaultStats
    } catch (error) {
      console.warn("Firebase getPlayerStats failed, using default stats:", error)
      return defaultStats
    }
  }

  async updatePlayerStats(userId: string, stats: PlayerStats): Promise<void> {
    if (!this.useFirebase || !db) {
      console.log("Mock: Updated player stats", stats)
      return Promise.resolve()
    }

    try {
      const playerRef = doc(db, "players", userId)
      await setDoc(playerRef, stats, { merge: true })
      console.log("Player stats updated successfully")
    } catch (error) {
      console.warn("Failed to update player stats:", error)
    }
  }

  async completeMission(
    userId: string,
    missionId: string,
    reward: { fuel: number; artifacts: number; rank: number },
  ): Promise<void> {
    if (!this.useFirebase || !db) {
      console.log("Mock: Mission completed", { missionId, reward })
      return Promise.resolve()
    }

    try {
      const playerRef = doc(db, "players", userId)
      const playerDoc = await getDoc(playerRef)

      if (playerDoc.exists()) {
        const currentStats = playerDoc.data() as PlayerStats
        const updatedStats: PlayerStats = {
          ...currentStats,
          fuel: currentStats.fuel + reward.fuel,
          artifacts: currentStats.artifacts + reward.artifacts,
          captainRank: currentStats.captainRank + reward.rank,
          completedMissions: [...currentStats.completedMissions, missionId],
        }
        await updateDoc(playerRef, { ...updatedStats })
        console.log("Mission completion updated successfully")
      }
    } catch (error) {
      console.warn("Failed to complete mission:", error)
    }
  }

  isUsingFirebase(): boolean {
    return this.useFirebase
  }
}

export const firebaseService = new FirebaseService()

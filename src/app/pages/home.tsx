import { GameForm } from "./game-form";

export const Home = () => {
  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <h1 className="text-3xl font-bold text-indigo-300">🎤 ESC Voting</h1>
      <p className="mt-2 text-gray-400">
        Start a new voting game with your friends! Rate all competing songs
        before the semi-finals air. Each person picks from five reactions for
        every country.
      </p>

      <h2 className="mt-10 text-lg font-semibold text-gray-200">
        Start a new game
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        Enter the names of everyone who will be voting.
      </p>

      <GameForm />
    </main>
  );
};

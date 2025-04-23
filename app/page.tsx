import { kv } from "@vercel/kv";
import { saveEmail } from "./actions";
import FeatureForm from "./form";
import { Feature } from "./types";

export let metadata = {
  title: "Next.js and Redis Example",
  description: "Feature roadmap example with Next.js with Redis.",
};

function VercelLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-label="Vercel Logo"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 19"
      {...props}
    >
      <path
        clipRule="evenodd"
        d="M12.04 2L2.082 18H22L12.04 2z"
        fill="#000"
        fillRule="evenodd"
        stroke="#000"
        strokeWidth="1.5"
      />
    </svg>
  );
}

async function getFeatures() {
  try {
    let itemIds = await kv.zrange("items_by_score", 0, 100, {
      rev: true,
    });

    if (!itemIds.length) {
      return [];
    }

    let multi = kv.multi();
    itemIds.forEach((id) => {
      multi.hgetall(`item:${id}`);
    });

    let items: Feature[] = await multi.exec();
    return items.map((item) => {
      return {
        ...item,
        score: item.score,
        created_at: item.created_at,
      };
    });
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function Page() {
  let features = await getFeatures();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center flex-1 px-4 sm:px-20 text-center">
        <div className="flex justify-center items-center bg-black rounded-full w-16 sm:w-24 h-16 sm:h-24 my-8">
          <VercelLogo className="h-8 sm:h-16 invert p-3 mb-1" />
        </div>
        <h1 className="text-lg sm:text-2xl font-bold mb-2">
          Song of the Week
        </h1>
        <h2 className="text-md sm:text-xl mx-4">
          Submit you song link here
        </h2>
        <div className="flex flex-wrap items-center justify-around max-w-4xl my-8 sm:w-full bg-white rounded-md shadow-xl h-full border border-gray-100">
          <FeatureForm features={features} />
          <hr className="border-1 border-gray-200 my-8 mx-8 w-full" />
        </div>
      </main>
    </div>
  );
}

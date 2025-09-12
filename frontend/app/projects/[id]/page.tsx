import Link from "next/link";

export default function ProjectHub() {
  return (
    <main>
      <h2>Project</h2>
      <ul>
        <li><Link href="./styles">Choose style</Link></li>
        <li><Link href="./ideas">Edit ideas</Link></li>
        <li><Link href="./render">Render pages</Link></li>
        <li><Link href="./review">Review & export</Link></li>
      </ul>
    </main>
  );
}



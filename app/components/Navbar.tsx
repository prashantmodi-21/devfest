import Image from "next/image"
import Link from "next/link"

const Navbar = () => {
  return (
    <header>
      <nav>
        <div className="logo">
          <Image src={"/icons/logo.png"} alt="logo" width={24} height={24} />
          <p>Devfest</p>
        </div>
        <ul>
          <Link href={"#home"}>Home</Link>
          <Link href={"#events"}>Events</Link>
          <Link href={"#create"}>Create Events</Link>
        </ul>
      </nav>
    </header>
  )
}

export default Navbar

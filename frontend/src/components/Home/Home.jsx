import { useState } from "react";
import PostsContainer from "./PostsContainer";
import Sidebar from "./Sidebar/Sidebar";
import MetaData from "../Layouts/MetaData";
import { MdArrowForwardIos } from "react-icons/md";

const Home = () => {
  const [open, setOpen] = useState(false);
  const handletoggle = () => {
    setOpen(!open);
  };
  return (
    <>
      <MetaData title="Instagram" />

      <div className="flex h-full md:w-4/5 lg:w-4/6 mt-14 mx-auto">
        <div className="sm:hidden fixed rounded-l-lg border-[1px] border-slate-200 top-[50vh] px-1 py-2 h-12 w-8 text-[30px] right-0 z-[1000] bg-white text-black">
          <MdArrowForwardIos
            onClick={handletoggle}
            className={` transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>

        <PostsContainer />
        <Sidebar status={open} />
      </div>
    </>
  );
};

export default Home;

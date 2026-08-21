import { Link } from "react-router";

const CustomLogo = () => {
  return (
    <Link to="/" className="flex items-center whitespace-nowrap">
      <span className="font-montserrat font-bold text-xl m-0 whitespace-nowrap">
        MindSave |
      </span>
      <p className="text-muted-foreground m-0 px-2 whitespace-nowrap">Admin</p>
    </Link>
  );
};

export default CustomLogo;

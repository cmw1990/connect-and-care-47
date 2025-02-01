import { Link } from "react-router-dom";
import { ButtonPrimary } from "../ui/button-primary";

export const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-primary text-xl font-bold">CareConnector</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/groups"
                className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
              >
                Care Groups
              </Link>
              <Link
                to="/tasks"
                className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
              >
                Tasks
              </Link>
              <Link
                to="/messages"
                className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
              >
                Messages
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <ButtonPrimary variant="outline" size="sm" className="mr-2">
              Sign In
            </ButtonPrimary>
            <ButtonPrimary size="sm">Sign Up</ButtonPrimary>
          </div>
        </div>
      </div>
    </nav>
  );
};
import React, { useEffect, useState, createContext, useContext } from "react";
import { BsSearch } from "react-icons/bs";
import "./App.css";

const CompaniesContext = createContext();

export default function App() {
  return (
    <CompaniesProvider>
      <div className="min-h-screen bg-gray-50 p-6">
        <Header />
        <Main/>
      </div>
    </CompaniesProvider>
  );
}

// Context Provider
function CompaniesProvider({ children }) {
  const [companies, setCompanies] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All");
  const [industry, setIndustry] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetch("http://localhost:5000/companies")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((data) => {
        data.sort((a, b) => a.id - b.id); // keep ID order
        setCompanies(data);
        setFiltered(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let result = [...companies];

    if (search.trim() !== "") {
      result = result.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (location !== "All") {
      result = result.filter((c) => c.location === location);
    }
    if (industry !== "All") {
      result = result.filter((c) => c.industry === industry);
    }

    setFiltered(result);
    setCurrentPage(1); // reset page on filter change
  }, [search, location, industry, companies]);

  return (
    <CompaniesContext.Provider
      value={{
        filtered,
        search,
        setSearch,
        location,
        setLocation,
        industry,
        setIndustry,
        loading,
        error,
        currentPage,
        setCurrentPage,
        itemsPerPage,
      }}
    >
      {children}
    </CompaniesContext.Provider>
  );
}

// Header
function Header() {
  const { search, setSearch, setLocation, setIndustry } = useContext(CompaniesContext);

  return (
    <div className="d-flex flex-wrap align-items-center justify-content-center mb-3 gap-3">
      <h1 className="text-center w-100 mt-2">Companies Directory</h1>

      <div className="input-group w-25">
        <input
          type="text"
          className="form-control"
          placeholder="Search by company name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="input-group-text">
          <BsSearch />
        </span>
      </div>

      <select
        className="form-select w-25"
        onChange={(e) => setLocation(e.target.value)}
      >
        <option value="All">All Locations</option>
        <option value="Hyderabad">Hyderabad</option>
        <option value="Bangalore">Bangalore</option>
        <option value="Chennai">Chennai</option>
        <option value="Mumbai">Mumbai</option>
        <option value="Pune">Pune</option>
        <option value="Delhi">Delhi</option>
        <option value="Kochi">Kochi</option>
      </select>

      <select
        className="form-select w-25"
        onChange={(e) => setIndustry(e.target.value)}
      >
        <option value="All">All Industries</option>
        <option value="Software">Software</option>
        <option value="IT Services">IT Services</option>
        <option value="AI & ML">AI & ML</option>
        <option value="Fintech">Fintech</option>
        <option value="Healthcare">Healthcare</option>
        <option value="EdTech">EdTech</option>
        <option value="Renewable Energy">Renewable Energy</option>
        <option value="Transportation">Transportation</option>
        <option value="Agritech">Agritech</option>
        <option value="Cybersecurity">Cybersecurity</option>
      </select>
    </div>
  );
}

// Main section
function Main() {
  const { filtered, loading, error, currentPage, setCurrentPage, itemsPerPage } =
    useContext(CompaniesContext);

  if (loading)
    return <p className="text-center text-gray-600 mt-10 text-lg">Loading data...</p>;
  if (error)
    return <p className="text-center text-red-500 mt-10 text-lg">Error: {error}</p>;
  if (filtered.length === 0)
    return <p className="text-center text-gray-500 mt-10 text-lg">No companies found.</p>;

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirst, indexOfLast);

 return (
  <div className="container mt-5">
  {/* Table Wrapper */}
  <div className="table-responsive">
    <table className="table table-bordered table-hover text-center">
      <thead className="table-light">
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Location</th>
          <th>Industry</th>
        </tr>
      </thead>
      <tbody>
        {currentItems.map((company) => (
          <tr key={company.id}>
            <td>{company.id}</td>
            <td>{company.name}</td>
            <td>{company.location}</td>
            <td>{company.industry}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Pagination */}
  <nav className="d-flex justify-content-center mt-4">
    <ul className="pagination">
      <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
        <button
          className="page-link"
          onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
        >
          Previous
        </button>
      </li>

      {Array.from({ length: totalPages }, (_, i) => (
        <li
          key={i + 1}
          className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
        >
          <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
            {i + 1}
          </button>
        </li>
      ))}

      <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
        <button
          className="page-link"
          onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </li>
    </ul>
  </nav>
</div>

);

}


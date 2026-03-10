import "./Table.css";
import CenterTable from "./CenterTable";

function Table({ children, top, bottom, left, right }) {
  return (
    <div className="table-grid">
      {children}

      <div className="center-table">
        <CenterTable top={top} bottom={bottom} left={left} right={right} />
      </div>
    </div>
  );
}

export default Table;
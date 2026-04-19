import "./Table.css"
import CenterTable from "./CenterTable"
import type { CardModel } from "../features/game/gameTypes"

interface TableProps {
  children: React.ReactNode
  top?: CardModel
  bottom?: CardModel
  left?: CardModel
  right?: CardModel
}

export default function Table({ children, top, bottom, left, right }: TableProps) {
  return (
    <div className="table-grid">
      {children}
      <div className="center-table">
        <CenterTable top={top} bottom={bottom} left={left} right={right} />
      </div>
    </div>
  )
}

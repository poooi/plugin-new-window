import type { ReactNode } from 'react'

import React from 'react'

interface DividerProps {
  text?: ReactNode
}

const Divider: React.FC<DividerProps> = ({ text }) => (
  <div className="divider">
    <h5>{text}</h5>
    <hr />
  </div>
)

export default Divider

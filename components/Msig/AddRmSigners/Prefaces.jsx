import { oneOf } from 'prop-types'
import { Warning } from '@glif/react-components'

const Preface = ({ method }) => {
  return (
    <>
      {method === 6 && (
        <Warning
          title='Warning'
          description={["You're about to remove an owner from your Safe."]}
        />
      )}
    </>
  )
}

Preface.propTypes = {
  method: oneOf([5, 6]).isRequired
}

export default Preface

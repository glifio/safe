import { oneOf } from 'prop-types'
import { Warning } from '@glif/react-components'

const Preface = ({ method }) => {
  return (
    <>
      {method === 5 && (
        <Warning
          title='Warning'
          description={[
            "You're about to add another signer to your Safe.",
            'Please make sure you know and trust the new owner as they will be able to withdraw funds from your Safe.'
          ]}
        />
      )}
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

import React from 'react'
import { Checkbox } from '@material-ui/core'
import { StarBorder, Star } from '@material-ui/icons'

const IndeterminateCheckbox = React.forwardRef(
    ({ indeterminate, ...rest }, ref) => {
        const defaultRef = React.useRef()
        const resolvedRef = ref || defaultRef

        React.useEffect(() => {
            resolvedRef.current.indeterminate = indeterminate
        }, [resolvedRef, indeterminate])

        return (
            <>
                <Checkbox ref={resolvedRef} {...rest} indeterminateIcon={<StarBorder></StarBorder>}
                    icon={<StarBorder></StarBorder>}
                    checkedIcon={<Star></Star>} />
            </>
        )
    }
)
IndeterminateCheckbox.displayName = 'IndeterminateCheckbox'

IndeterminateCheckbox.propTypes = {
}

export default IndeterminateCheckbox
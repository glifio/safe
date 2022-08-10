import styled from 'styled-components'

export const ButtonsTD = styled.td`
  color: var(--gray-medium);
  text-align: right;

  > div {
    display: flex;
    align-items: center;
    justify-content: end;
    gap: var(--space-s);

    > span {
      cursor: pointer;
      transition: transform 0.1s ease-out;

      &:hover {
        transform: scale(1.2);
      }

      svg {
        vertical-align: middle;
      }
    }
  }
`
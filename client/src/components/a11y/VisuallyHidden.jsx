const style = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

export default function VisuallyHidden({ children, as: Tag = 'span', ...props }) {
  return (
    <Tag style={style} {...props}>
      {children}
    </Tag>
  );
}

export default function PageHeader({ eyebrow, title, lede, children }) {
  return (
    <header className="page-header">
      <div className="page-header__text">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="page-title">{title}</h1>
        {lede && <p className="lede">{lede}</p>}
      </div>
      {children && <div className="page-header__actions">{children}</div>}
    </header>
  );
}

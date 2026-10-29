export default function EmptyState({ icon: Icon, title, children, actions }) {
  return (
    <div className="empty-state">
      {Icon && (
        <div className="empty-state__icon" aria-hidden="true">
          <Icon size={22} strokeWidth={1.6} />
        </div>
      )}
      <h3 className="empty-state__title">{title}</h3>
      {children && <div className="empty-state__body">{children}</div>}
      {actions && <div className="empty-state__actions">{actions}</div>}
    </div>
  );
}

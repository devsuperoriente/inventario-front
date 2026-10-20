function PageHeading({ eyebrow, title, description, action, className = '' }) {
  return (
    <div className={`page-heading ${className}`.trim()}>
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export default PageHeading

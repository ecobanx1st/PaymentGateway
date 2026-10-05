 <header className="flex justify-between h-16 shrink-0 items-center gap-3 border-b border-input-border px-4 sm:px-5 lg:px-6">

          {/* ── Left: breadcrumb (desktop) / logo (mobile) ── */}
          <div className="flex min-w-0 shrink-0 items-center">
            {/* Logo centred on mobile */}
            <Link href="/User/dashboard" className="flex items-center md:hidden">
              <Image src="/logo.png" alt="Eco Banx" width={40} height={40} priority />
            </Link>
            {/* Breadcrumb on desktop */}
            <div className="hidden md:block">
              <Breadcrumb items={breadcrumbItems} />
            </div>
          </div>

          {/* ── Centre: search bar ── */}
          <div className="hidden md:block flex flex-1 items-center justify-center px-2 md:justify-start ">
            <div className="relative w-full max-w-xs md:max-w-sm lg:max-w-md">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text"
              />
              <input
                type="search"
                placeholder="Search…"
                aria-label="Search"
                className="w-full rounded-full border border-input-border bg-input-bg py-1.5 pl-9 pr-4 text-[13px] text-theme-text placeholder:text-secondary-text transition-all duration-200 focus:border-theme-text focus:outline-none hover:bg-secondary-bg"
              />
            </div>
          </div>

          {/* ── Right: mobile hamburger ── */}
          <div className="flex shrink-0 items-center gap-2">
            {/* Desktop: avatar moved to sidebar */}

            {/* Mobile-only: hamburger (alone) */}
            <button
              ref={menuButtonRef}
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-secondary-text text-secondary-text transition hover:border-primary-text hover:text-primary-text md:hidden"
              onClick={() => setSidebarOpen((open) => !open)}
              aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={sidebarOpen}
              aria-controls="user-sidebar"
            >
              <Menu size={18} />
            </button>
          </div>
        </header>

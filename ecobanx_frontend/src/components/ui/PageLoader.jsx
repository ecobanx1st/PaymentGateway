"use client";

export default function PageLoader() {
  return (
    <div className="page-loader">
      <svg
        className="pl1"
        width="128"
        height="128"
        viewBox="0 0 128 128"
      >
        <defs>
          <linearGradient id="pl-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#000" />
            <stop offset="100%" stopColor="#fff" />
          </linearGradient>

          <mask id="pl-mask">
            <rect
              x="0"
              y="0"
              width="128"
              height="128"
              fill="url(#pl-grad)"
            />
          </mask>
        </defs>

        <g fill="var(--primary)">
          <g className="pl1__g">
            <g transform="translate(20,20) rotate(0,44,44)">
              <g className="pl1__rect-g">
                <rect
                  className="pl1__rect"
                  width="40"
                  height="40"
                  rx="8"
                  ry="8"
                />
                <rect
                  className="pl1__rect"
                  transform="translate(0,48)"
                  width="40"
                  height="40"
                  rx="8"
                  ry="8"
                />
              </g>

              <g
                className="pl1__rect-g"
                transform="rotate(180,44,44)"
              >
                <rect
                  className="pl1__rect"
                  width="40"
                  height="40"
                  rx="8"
                  ry="8"
                />
                <rect
                  className="pl1__rect"
                  transform="translate(0,48)"
                  width="40"
                  height="40"
                  rx="8"
                  ry="8"
                />
              </g>
            </g>
          </g>
        </g>

        <g mask="url(#pl-mask)" fill="var(--primary)">
          <g className="pl1__g">
            <g transform="translate(20,20) rotate(0,44,44)">
              <g className="pl1__rect-g">
                <rect
                  className="pl1__rect"
                  width="40"
                  height="40"
                  rx="8"
                  ry="8"
                />
                <rect
                  className="pl1__rect"
                  transform="translate(0,48)"
                  width="40"
                  height="40"
                  rx="8"
                  ry="8"
                />
              </g>

              <g
                className="pl1__rect-g"
                transform="rotate(180,44,44)"
              >
                <rect
                  className="pl1__rect"
                  width="40"
                  height="40"
                  rx="8"
                  ry="8"
                />
                <rect
                  className="pl1__rect"
                  transform="translate(0,48)"
                  width="40"
                  height="40"
                  rx="8"
                  ry="8"
                />
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
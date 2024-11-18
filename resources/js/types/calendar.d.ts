export type Timestamps = {
    created_at?: string,
    updated_at?: string,
}

export type Project = Timestamps & {
    name: string,
    id: string,
    note: string,
    customer_id: string,
};

export type Customer = Timestamps & {
    name: string,
    id: string,
    note: string,
    projects: Project[],
};

export type Service = Timestamps & {
    name: string,
    id: string,
    note: string,
};

export type TimeEntry = Timestamps & {
    id: string,
    date_at: string,
    minutes: number,
    note: string,
    project: Project | null,
    project_id: string | null,
    service: Service | null,
    service_id: string | null,
};

export type TimeEntryTemplateActivity = Timestamps & {
    id: string,
    name: string,
    description: string,
    minutes?: number,
    priority?: number,
    is_always_active: boolean,
    is_random_allowed: boolean,
    cron_expression?: string,
    time_entry_template_content_id: string,
};

export type TimeEntryTemplateContent = Omit<TimeEntry, 'date_at' | 'note'> & {
    start_time: string,
    pause_time: number,
    minutes: number,
    jitter_minutes: number,
    jitter_increments: number,
    n_activities: number,
    activities: TimeEntryTemplateActivity[],
};

export type TimeEntryTemplate = Timestamps & {
    id: string,
    name: string,
    description: string,
    contents: TimeEntryTemplateContent[],
};
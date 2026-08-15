export interface Schedule {
	type: string;
	days: string;
	time: string;
	room: string;
	instructor: string;
}

export interface Course {
	id: number;
	crn: number;
	section: string;
	courseCode: string;
	courseNumber: string;
	title: string;
	primaryInstructor: string;
	credits: number;
	branch: string;
	schedules: Schedule[];
}

export interface SearchParams {
	termCode?: string;
	page?: number;
	limit?: number;
	q?: string;
	days?: string;
	instructor?: string;
	startTime?: string;
	endTime?: string;
	level?: string;
	crn?: string;
	section?: string;
	branch?: string;
	gender?: string;
}

export interface SearchResponse {
	status: string;
	meta: {
		termName: string;
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
	data: Course[];
}

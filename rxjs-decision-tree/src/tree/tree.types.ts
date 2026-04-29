// src/tree/tree.types.ts
export type TreeNode = QuestionNode | LeafNode

export interface QuestionNode {
	kind:     'question'
	id:       string
	question: string
	hint?:    string
	branches: Branch[]
}

export interface Branch {
	label: string
	next:  TreeNode
}

export interface LeafNode {
	kind:      'leaf'
	id:        string
	operators: OperatorResult[]
}

export interface OperatorResult {
	name:     string
	oneliner: string
	wikiPath: string
	primary:  boolean
}

export interface DetailView {
	operatorName: string
	oneliner:     string
	wikiPath:     string
}

export interface TreeState {
	currentNode: TreeNode
	history:     QuestionNode[]
	breadcrumb:  BreadcrumbStep[]
	detailView:  DetailView | null
}

export interface BreadcrumbStep {
	nodeId: string
	label:  string
}

export type Action =
	| { kind: 'answer'; next: TreeNode; label: string }
	| { kind: 'back' }
	| { kind: 'reset' }
	| { kind: 'open-detail';  operatorName: string; oneliner: string; wikiPath: string }
	| { kind: 'close-detail' }
